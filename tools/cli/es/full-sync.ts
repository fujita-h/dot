import 'dotenv/config';

import { get_encoding } from '@dqbd/tiktoken';
import { PrismaClient } from '@prisma/client';
import aoaiEmbedding from '../../../libs/azure/openai/embedding/instance';
import blob from '../../../libs/azure/storeage-blob/instance';
import es from '../../../libs/elasticsearch/instance';
import { generateTipTapText } from '../../../libs/tiptap/text';

const AOAI_CAPACITY_TPM = 120 * 1000;

const prisma = new PrismaClient();

const main = async () => {
  const indexExists = await es.existsIndex('notes');
  if (indexExists) {
    console.log('Index "notes" exists, deleting...');
    await es.deleteIndex('notes');
    console.log('Index "notes" deleted.');
  }

  console.log('Creating index "notes"...');
  await es.init('notes');
  console.log('Index "notes" created.');

  console.log('Checking for notes...');
  const noteIds = await prisma.note.findMany({ select: { id: true } }).then((notes) => notes.map((n) => n.id));
  console.log(`Found ${noteIds.length.toLocaleString()} notes in the database.`);

  console.log('=== Start full sync of notes to Elasticsearch ===');
  let totalTokens = 0;
  for (let [index, noteId] of noteIds.entries()) {
    try {
      const time1 = Date.now();
      const note = await prisma.note
        .findUnique({
          where: { id: noteId },
          include: {
            User: { select: { uid: true, handle: true, name: true } },
            Group: { select: { handle: true, name: true, type: true } },
            Topics: { select: { topicId: true, Topic: { select: { handle: true, name: true } }, order: true } },
          },
        })
        .catch((e) => null);

      // Skip if note is not found
      if (!note) {
        console.log(`Note ${noteId} not found.`);
        continue;
      }

      if (!note.bodyBlobName) {
        console.log(`Note ${noteId} does not have a bodyBlobName.`);
        continue;
      }

      const body = await blob
        .downloadToBuffer('notes', note.bodyBlobName)
        .then((res) => res.toString('utf-8'))
        .catch((e) => null);

      if (!body) {
        console.log(`Note ${noteId} bodyBlobName "${note.bodyBlobName}" not found.`);
        continue;
      }

      // create TipTap text
      const bodyText = generateTipTapText(body);

      // count body tokens, if it's over 8000, slice it
      const encoding = await get_encoding('cl100k_base');
      const tokens = await encoding.encode(bodyText);
      const token_slice = tokens.slice(0, 8000);
      const body_slice = new TextDecoder().decode(encoding.decode(token_slice));
      encoding.free();

      const timeToSleepForAoaiCapacity = token_slice.length / (AOAI_CAPACITY_TPM / 60 / 1000);

      console.log(
        `Note ${noteId} has ${tokens.length.toLocaleString()} tokens, slicing to ${token_slice.length.toLocaleString()} tokens.`
      );

      // get embedding
      let embed: number[] | undefined = undefined;
      if (body_slice.length > 0) {
        embed = await aoaiEmbedding
          .getEmbedding(body_slice)
          .then((res) => {
            const data = res.data;
            if (data.length === 0) {
              return undefined;
            }
            totalTokens += res.usage.total_tokens;
            return data[0].embedding;
          })
          .catch((err) => {
            console.error(err);
            return undefined;
          });
      }
      const embed_3072 = embed ? fixArraySize(embed, 3072) : undefined;
      const embed_1536 = embed ? fixArraySize(embed, 1536) : undefined;
      const embed_768 = embed ? fixArraySize(embed, 768) : undefined;

      await es.create('notes', note.id, {
        ...note,
        body: bodyText,
        body_embed_model_deployment: aoaiEmbedding.deployment,
        body_embed_768: embed_768,
        body_embed_1536: embed_1536,
        body_embed_3072: embed_3072,
      });

      const time2 = Date.now();

      // sleep to avoid exceeding AOAI capacity, add 200ms for safety
      const timeToSleep = Math.max(200, 200 + timeToSleepForAoaiCapacity - (time2 - time1));
      await sleep(timeToSleep);
    } catch (e) {
      console.error(e);
    }
    if ((index + 1) % 100 === 0) {
      console.log(`Progress: Processed ${(index + 1).toLocaleString()} of ${noteIds.length.toLocaleString()} notes.`);
    }
  }
  console.log('=== End full sync of notes to Elasticsearch ===');
  console.log(`Total tokens processef by AOAI: ${totalTokens.toLocaleString()} tokens.`);
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fixes the size of an array by either filling the remaining elements with 0.0 or slicing it.
 * @param arr - The array to fix the size of.
 * @param fixedLength - The desired fixed length of the array.
 * @returns The array with the fixed size.
 */
function fixArraySize(arr: number[], fixedLength: number): number[] {
  // if array length is less than 1000, fill the rest with 0.0
  if (arr.length < fixedLength) {
    return [...arr, ...Array(fixedLength - arr.length).fill(0.0)];
  }
  // if array length is more than 1000, slice it
  else if (arr.length > fixedLength) {
    return arr.slice(0, fixedLength);
  }
  // if array length is 1000, return it
  return arr;
}

main();
