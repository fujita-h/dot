'use server';

import { getSessionUser } from '@/libs/auth/utils';
import aoaiCompletion from '@/libs/azure/openai/completion/instance';
import aoaiEmbedding from '@/libs/azure/openai/embedding/instance';
import blob from '@/libs/azure/storeage-blob/instance';
import { EDITOR_AI_COMPLETION_PROMPT } from '@/libs/constants';
import es from '@/libs/elasticsearch/instance';
import { checkPostableGroup } from '@/libs/prisma/group';
import prisma from '@/libs/prisma/instance';
import { getEditorAiCompletionPrompt } from '@/libs/prisma/user-setting';
import { generateTipTapText } from '@/libs/tiptap/text';
import { get_encoding } from '@dqbd/tiktoken';
import { init as initCuid } from '@paralleldrive/cuid2';

const cuid = initCuid({ length: 24 });

export async function processAutoSave(
  draftId: string,
  groupId: string | undefined,
  relatedNoteId: string | undefined,
  title?: string,
  topics?: string[],
  body?: string
) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }

  if (groupId) {
    const postable = await checkPostableGroup(user.id, groupId).catch((err) => false);
    if (!postable) {
      return { error: 'Forbbiden' };
    }
  }

  const metadata = {
    userId: user.id,
    groupId: groupId || 'n/a',
    userName: encodeURI(user.name || 'n/a'),
    oid: user.oid || 'n/a',
    uid: user.uid || 'n/a',
  };

  // Each blob can have up to 10 blob index tags.
  // Tag values must be alphanumeric and valid special characters (space, plus, minus, period, colon, equals, underscore, forward slash).
  // Tag keys must be between one and 128 characters.
  // Tag values must be between zero and 256 characters.
  const tags = {
    userId: user.id,
    groupId: groupId || 'n/a',
    oid: user.oid || 'n/a',
    uid: user.uid || 'n/a',
  };

  let blobName = undefined;
  if (body !== undefined) {
    // create TipTap text for check valid json
    const bodyText = generateTipTapText(body);

    blobName = `${draftId}/${cuid()}`;
    const blobUploadResult = await blob
      .upload('drafts', blobName, 'application/json', body, metadata, tags)
      .then((res) => res._response.status)
      .catch((err) => 500);

    if (blobUploadResult !== 201) {
      return { error: 'Failed to upload draft' };
    }
  }

  let _topics = undefined;
  if (topics !== undefined) {
    _topics = {
      deleteMany: { draftId: draftId },
      create: topics.map((topic) => ({ topicId: topic, order: topics.indexOf(topic) })),
    };
  }

  const draft = await prisma.draft
    .update({
      where: { id: draftId, userId: user.id },
      data: {
        title: title,
        groupId: groupId,
        relatedNoteId: relatedNoteId,
        Topics: _topics,
        bodyBlobName: blobName,
      },
    })
    .catch((err) => null);

  if (!draft) {
    if (blobName) await blob.delete('drafts', blobName).catch((err) => null);
    return { error: 'Failed to update draft' };
  }

  return draft;
}

export async function processDraft(
  draftId: string,
  groupId: string | undefined,
  relatedNoteId: string | undefined,
  title: string,
  topics: string[],
  body?: string
) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }

  if (body === undefined) {
    return { error: 'body is undefined' };
  }

  if (groupId) {
    const postable = await checkPostableGroup(user.id, groupId).catch((err) => false);
    if (!postable) {
      return { error: 'Forbbiden' };
    }
  }

  const metadata = {
    userId: user.id,
    groupId: groupId || 'n/a',
    userName: encodeURI(user.name || 'n/a'),
    oid: user.oid || 'n/a',
    uid: user.uid || 'n/a',
  };

  // Each blob can have up to 10 blob index tags.
  // Tag values must be alphanumeric and valid special characters (space, plus, minus, period, colon, equals, underscore, forward slash).
  // Tag keys must be between one and 128 characters.
  // Tag values must be between zero and 256 characters.
  const tags = {
    userId: user.id,
    groupId: groupId || 'n/a',
    oid: user.oid || 'n/a',
    uid: user.uid || 'n/a',
  };

  // create TipTap text for check valid json
  const bodyText = generateTipTapText(body);

  const blobName = `${draftId}/${cuid()}`;
  const blobUploadResult = await blob
    .upload('drafts', blobName, 'application/json', body, metadata, tags)
    .then((res) => res._response.status)
    .catch((err) => 500);

  if (blobUploadResult !== 201) {
    return { error: 'Failed to upload draft' };
  }

  const draft = await prisma.draft
    .update({
      where: { id: draftId, userId: user.id },
      data: {
        title: title,
        groupId: groupId,
        relatedNoteId: relatedNoteId,
        Topics: {
          deleteMany: { draftId: draftId },
          create: topics.map((topic) => ({ topicId: topic, order: topics.indexOf(topic) })),
        },
        bodyBlobName: blobName,
      },
    })
    .catch((err) => null);

  if (!draft) {
    await blob.delete('drafts', blobName).catch((err) => null);
    return { error: 'Failed to update draft' };
  }

  return draft;
}

export async function processPublish(
  draftId: string,
  groupId: string | undefined,
  relatedNoteId: string | undefined,
  title: string,
  topics: string[],
  body?: string
) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }
  const userId = user.id;

  if (body === undefined) {
    return { error: 'body is undefined' };
  }

  if (groupId) {
    const postable = await checkPostableGroup(user.id, groupId).catch((err) => false);
    if (!postable) {
      return { error: 'Forbbiden' };
    }
  }

  const metadata = {
    userId: user.id,
    groupId: groupId || 'n/a',
    userName: encodeURI(user.name || 'n/a'),
    oid: user.oid || 'n/a',
    uid: user.uid || 'n/a',
  };

  // Each blob can have up to 10 blob index tags.
  // Tag values must be alphanumeric and valid special characters (space, plus, minus, period, colon, equals, underscore, forward slash).
  // Tag keys must be between one and 128 characters.
  // Tag values must be between zero and 256 characters.
  const tags = {
    userId: user.id,
    groupId: groupId || 'n/a',
    oid: user.oid || 'n/a',
    uid: user.uid || 'n/a',
  };

  // create TipTap text
  const bodyText = generateTipTapText(body);

  // count body tokens, if it's over 8000, slice it
  const encoding = await get_encoding('cl100k_base');
  const tokens = await encoding.encode(bodyText);
  const token_slice = tokens.slice(0, 8000);
  const body_slice = new TextDecoder().decode(encoding.decode(token_slice));
  encoding.free();

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

  if (relatedNoteId) {
    // update note
    const blobName = `${relatedNoteId}/${cuid()}`;
    const blobUploadResult = await blob
      .upload('notes', blobName, 'application/json', body, metadata, tags)
      .then((res) => res._response.status)
      .catch((err) => 500);
    if (blobUploadResult !== 201) {
      return { error: 'Failed to upload note' };
    }

    const note = await prisma.$transaction(async (tx) => {
      const note = await tx.note.update({
        where: { id: relatedNoteId, userId: user.id, Drafts: { some: { id: draftId } } },
        data: {
          title: title,
          groupId: groupId,
          Topics: {
            deleteMany: { noteId: relatedNoteId },
            create: topics.map((topic) => ({ topicId: topic, order: topics.indexOf(topic) })),
          },
          bodyBlobName: blobName,
        },
        include: {
          User: { select: { uid: true, handle: true, name: true } },
          Group: { select: { handle: true, name: true, type: true } },
          Topics: { select: { topicId: true, Topic: { select: { handle: true, name: true } }, order: true } },
        },
      });
      await es.create('notes', note.id, {
        ...note,
        body: bodyText,
        body_embed_model_deployment: aoaiEmbedding.deployment,
        body_embed_768: embed_768,
        body_embed_1536: embed_1536,
        body_embed_3072: embed_3072,
      });
      await tx.draft.delete({ where: { id: draftId } });
      return note;
    });

    if (!note) {
      await blob.delete('notes', blobName).catch((err) => null);
      return { error: 'Failed to update note' };
    }
    return note;
  } else {
    // create note
    const noteId = cuid();
    const blobName = `${noteId}/${cuid()}`;
    const blobUploadResult = await blob
      .upload('notes', blobName, 'application/json', body, metadata, tags)
      .then((res) => res._response.status)
      .catch((err) => 500);
    if (blobUploadResult !== 201) {
      return { error: 'Failed to upload note' };
    }

    const note = await prisma.$transaction(async (tx) => {
      const note = await tx.note.create({
        data: {
          id: noteId,
          userId: userId,
          title: title,
          groupId: groupId,
          Topics: {
            create: topics.map((topic) => ({ topicId: topic, order: topics.indexOf(topic) })),
          },
          bodyBlobName: blobName,
          releasedAt: new Date(),
        },
        include: {
          User: { select: { uid: true, handle: true, name: true } },
          Group: { select: { handle: true, name: true, type: true } },
          Topics: { select: { topicId: true, Topic: { select: { handle: true, name: true } }, order: true } },
        },
      });
      await es.create('notes', note.id, {
        ...note,
        body: bodyText,
        body_embed_model_deployment: aoaiEmbedding.deployment,
        body_embed_768: embed_768,
        body_embed_1536: embed_1536,
        body_embed_3072: embed_3072,
      });
      await tx.draft.delete({ where: { id: draftId } });
      return note;
    });

    if (!note) {
      await blob.delete('notes', blobName).catch((err) => null);
      return { error: 'Failed to create note' };
    }
    return note;
  }
}

export async function textCompletion(text: string) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    // Note: When using the Server Function, throw message is not delivered to the client.
    throw new Error('Unauthorized');
  }
  const userId = user.id;

  if (!text) return '';
  // retun empty string if text is only space, tab, or newline.
  if (text.replace(/\s/g, '') === '') return '';

  const prompt = await getEditorAiCompletionPrompt(userId)
    .then((res) => {
      if (res?.editorAiCompletionPrompt) return res.editorAiCompletionPrompt;
      return EDITOR_AI_COMPLETION_PROMPT;
    })
    .catch((err) => EDITOR_AI_COMPLETION_PROMPT);

  return aoaiCompletion.getCompletion(prompt + text).then((res) => res.choices[0].text);
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
