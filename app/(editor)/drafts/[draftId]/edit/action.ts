'use server';

import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import blob from '@/libs/azure/storeage-blob/instance';
import es from '@/libs/elasticsearch/instance';
import { checkPostableGroup } from '@/libs/prisma/group';
import prisma from '@/libs/prisma/instance';
import { getUserWithClaims } from '@/libs/prisma/user';
import { init as initCuid } from '@paralleldrive/cuid2';
import { generateText } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import BlockquoteExtension from '@tiptap/extension-blockquote';
import BulletListExtension from '@tiptap/extension-bullet-list';
import CodeBlockExtension from '@tiptap/extension-code-block';
import DocumentExtension from '@tiptap/extension-document';
import HardBreakExtension from '@tiptap/extension-hard-break';
import HeadingExtension from '@tiptap/extension-heading';
import HorizontalRuleExtension from '@tiptap/extension-horizontal-rule';
import ListItemExtension from '@tiptap/extension-list-item';
import OrderedListExtension from '@tiptap/extension-ordered-list';
import ParagraphExtension from '@tiptap/extension-paragraph';
import TextExtension from '@tiptap/extension-text';
import BoldExtension from '@tiptap/extension-bold';
import CodeExtension from '@tiptap/extension-code';
import ItalicExtension from '@tiptap/extension-italic';
import StrikeExtension from '@tiptap/extension-strike';
import DropcursorExtension from '@tiptap/extension-dropcursor';
import GapcursorExtension from '@tiptap/extension-gapcursor';
import HistoryExtension from '@tiptap/extension-history';

const cuid = initCuid({ length: 24 });

export async function processAutoSave(
  draftId: string,
  groupId: string | undefined,
  relatedNoteId: string | undefined,
  title?: string,
  topics?: string[],
  body?: string
) {
  const session = await auth();
  const { userId } = await getUserIdFromSession(session);
  if (!userId) throw new Error('Unauthorized');
  const user = await getUserWithClaims(userId);
  if (!user) throw new Error('Unauthorized');

  if (groupId) {
    const postable = await checkPostableGroup(user.id, groupId).catch((err) => false);
    if (!postable) throw new Error('Forbbiden');
  }

  const metadata = {
    userId: user.id,
    groupId: groupId || 'n/a',
    userName: encodeURI(user.name) || 'n/a',
    oid: user.Claim?.oid || 'n/a',
  };

  // Each blob can have up to 10 blob index tags.
  // Tag values must be alphanumeric and valid special characters (space, plus, minus, period, colon, equals, underscore, forward slash).
  // Tag keys must be between one and 128 characters.
  // Tag values must be between zero and 256 characters.
  const tags = {
    userId: user.id,
    groupId: groupId || 'n/a',
    oid: user.Claim?.oid || 'n/a',
  };

  let blobName = undefined;
  if (body !== undefined) {
    blobName = `${draftId}/${cuid()}`;
    const blobUploadResult = await blob
      .upload('drafts', blobName, 'application/json', body, metadata, tags)
      .then((res) => res._response.status)
      .catch((err) => 500);

    if (blobUploadResult !== 201) throw new Error('Failed to upload draft');
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
    throw new Error('Failed to update draft');
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
  const session = await auth();
  const { userId } = await getUserIdFromSession(session);
  if (!userId) throw new Error('Unauthorized');
  const user = await getUserWithClaims(userId);
  if (!user) throw new Error('Unauthorized');

  if (body === undefined) {
    throw new Error('body is undefined');
  }

  if (groupId) {
    const postable = await checkPostableGroup(user.id, groupId).catch((err) => false);
    if (!postable) throw new Error('Forbbiden');
  }

  const metadata = {
    userId: user.id,
    groupId: groupId || 'n/a',
    userName: encodeURI(user.name) || 'n/a',
    oid: user.Claim?.oid || 'n/a',
  };

  // Each blob can have up to 10 blob index tags.
  // Tag values must be alphanumeric and valid special characters (space, plus, minus, period, colon, equals, underscore, forward slash).
  // Tag keys must be between one and 128 characters.
  // Tag values must be between zero and 256 characters.
  const tags = {
    userId: user.id,
    groupId: groupId || 'n/a',
    oid: user.Claim?.oid || 'n/a',
  };

  const blobName = `${draftId}/${cuid()}`;
  const blobUploadResult = await blob
    .upload('drafts', blobName, 'application/json', body, metadata, tags)
    .then((res) => res._response.status)
    .catch((err) => 500);

  if (blobUploadResult !== 201) throw new Error('Failed to upload draft');

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
    throw new Error('Failed to update draft');
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
  const session = await auth();
  const { userId } = await getUserIdFromSession(session);
  if (!userId) throw new Error('Unauthorized');
  const user = await getUserWithClaims(userId);
  if (!user) throw new Error('Unauthorized');

  if (body === undefined) {
    throw new Error('body is undefined');
  }

  if (groupId) {
    const postable = await checkPostableGroup(user.id, groupId).catch((err) => false);
    if (!postable) throw new Error('Forbbiden');
  }

  const metadata = {
    userId: user.id,
    groupId: groupId || 'n/a',
    userName: encodeURI(user.name) || 'n/a',
    oid: user.Claim?.oid || 'n/a',
  };

  // Each blob can have up to 10 blob index tags.
  // Tag values must be alphanumeric and valid special characters (space, plus, minus, period, colon, equals, underscore, forward slash).
  // Tag keys must be between one and 128 characters.
  // Tag values must be between zero and 256 characters.
  const tags = {
    userId: user.id,
    groupId: groupId || 'n/a',
    oid: user.Claim?.oid || 'n/a',
  };

  let bodyText: string = body;
  try {
    bodyText = generateText(JSON.parse(body), [
      BlockquoteExtension,
      BulletListExtension,
      CodeBlockExtension,
      DocumentExtension,
      HardBreakExtension,
      HeadingExtension,
      HorizontalRuleExtension,
      ListItemExtension,
      OrderedListExtension,
      ParagraphExtension,
      TextExtension,
      BoldExtension,
      CodeExtension,
      ItalicExtension,
      StrikeExtension,
      DropcursorExtension,
      GapcursorExtension,
      HistoryExtension,
      Image,
    ]);
  } catch (err) {}

  if (relatedNoteId) {
    // update note
    const blobName = `${relatedNoteId}/${cuid()}`;
    const blobUploadResult = await blob
      .upload('notes', blobName, 'application/json', body, metadata, tags)
      .then((res) => res._response.status)
      .catch((err) => 500);
    if (blobUploadResult !== 201) throw new Error('Failed to upload note');

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
          User: { select: { handle: true, name: true } },
          Group: { select: { handle: true, name: true, type: true } },
          Topics: { select: { topicId: true, Topic: { select: { handle: true, name: true } }, order: true } },
        },
      });
      tx.draft.delete({ where: { id: draftId } });
      es.create('notes', note.id, { ...note, body: bodyText });
      return note;
    });

    if (!note) {
      await blob.delete('notes', blobName).catch((err) => null);
      throw new Error('Failed to update note');
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
    if (blobUploadResult !== 201) throw new Error('Failed to upload note');

    const note = await prisma.$transaction(async (tx) => {
      const note = await tx.note.create({
        data: {
          id: noteId,
          userId: user.id,
          title: title,
          groupId: groupId,
          Topics: {
            create: topics.map((topic) => ({ topicId: topic, order: topics.indexOf(topic) })),
          },
          bodyBlobName: blobName,
          releasedAt: new Date(),
        },
        include: {
          User: { select: { handle: true, name: true } },
          Group: { select: { handle: true, name: true, type: true } },
          Topics: { select: { topicId: true, Topic: { select: { handle: true, name: true } }, order: true } },
        },
      });
      await tx.draft.delete({ where: { id: draftId } });
      es.create('notes', note.id, { ...note, body: bodyText });
      return note;
    });

    if (!note) {
      await blob.delete('notes', blobName).catch((err) => null);
      throw new Error('Failed to update note');
    }
    return note;
  }
}
