'use server';

import prisma from '@/prisma/instance';
import blob from '@/libs/azure/storeage-blob/instance';
import { init as initCuid } from '@paralleldrive/cuid2';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { getUserWithClaims } from '@/libs/prisma/user';

const cuid = initCuid({ length: 24 });

export interface ActionState {
  status: string | null;
  message: string | null;
  redirect: string | null;
  lastModified: number;
}

export async function action(state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  const { userId } = await getUserIdFromSession(session);
  if (!userId) {
    return { status: 'error', message: 'not authorized', redirect: null, lastModified: Date.now() };
  }
  const user = await getUserWithClaims(userId);
  if (!user) {
    return { status: 'error', message: 'user not found', redirect: null, lastModified: Date.now() };
  }

  const draftId = formData.get('draftId') as string;
  const groupId = (formData.get('groupId') as string) || undefined;
  const relatedNoteId = (formData.get('relatedNoteId') as string) || undefined;
  const title = formData.get('title') as string;
  const topics = formData.getAll('topics') as string[];
  const body = formData.get('body') as string;
  const submit = formData.get('submit') as string;

  if (!draftId) {
    return { status: 'error', message: 'invalid draft id', redirect: null, lastModified: Date.now() };
  }
  switch (submit) {
    case 'draft':
      return processDraft(user, draftId, groupId, relatedNoteId, title, topics, body);
    case 'publish':
      return processPublish(user, draftId, groupId, relatedNoteId, title, topics, body);
    default:
      return { status: 'error', message: 'invalid submit', redirect: null, lastModified: Date.now() };
  }
}

async function processDraft(
  user: { id: string; name: string; Claim: { oid: string | null } | null },
  draftId: string,
  groupId: string | undefined,
  relatedNoteId: string | undefined,
  title: string,
  topics: string[],
  body: string
): Promise<ActionState> {
  const metadata = {
    userId: user.id,
    groupId: groupId || '',
    userName: user.name || '',
    oid: user.Claim?.oid || '',
  };
  const tags = {
    userId: user.id,
    groupId: groupId || '',
    userName: user.name || '',
    oid: user.Claim?.oid || '',
  };

  const blobName = `${draftId}/${cuid()}`;
  const blobUploadResult = await blob
    .upload('drafts', blobName, 'text/markdown', body, metadata, tags)
    .then((res) => res._response.status)
    .catch((err) => 500);

  if (blobUploadResult !== 201) {
    return { status: 'error', message: 'blob upload failed', redirect: null, lastModified: Date.now() };
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
    return { status: 'error', message: 'draft update failed', redirect: null, lastModified: Date.now() };
  }

  return { status: 'success', message: null, redirect: '/drafts', lastModified: Date.now() };
}

async function processPublish(
  user: { id: string; name: string; Claim: { oid: string | null } | null },
  draftId: string,
  groupId: string | undefined,
  relatedNoteId: string | undefined,
  title: string,
  topics: string[],
  body: string
) {
  const metadata = {
    userId: user.id,
    userName: user.name,
    oid: user.Claim?.oid || '',
  };
  const tags = {
    userId: user.id,
    userName: user.name,
    oid: user.Claim?.oid || '',
  };

  if (relatedNoteId) {
    // update note
    const blobName = `${relatedNoteId}/${cuid()}`;
    const blobUploadResult = await blob
      .upload('notes', blobName, 'text/markdown', body, metadata, tags)
      .then((res) => res._response.status)
      .catch((err) => 500);
    if (blobUploadResult !== 201) {
      return { status: 'error', message: 'blob upload failed', redirect: null, lastModified: Date.now() };
    }

    const [note, draft] = await prisma.$transaction([
      prisma.note.update({
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
      }),
      prisma.draft.delete({ where: { id: draftId } }),
    ]);

    if (!note) {
      await blob.delete('notes', blobName).catch((err) => null);
      return { status: 'error', message: 'note update failed', redirect: null, lastModified: Date.now() };
    }
    return { status: 'success', message: null, redirect: `/notes/${note.id}`, lastModified: Date.now() };
  } else {
    // create note
    const noteId = cuid();
    const blobName = `${noteId}/${cuid()}`;
    const blobUploadResult = await blob
      .upload('notes', blobName, 'text/markdown', body, metadata, tags)
      .then((res) => res._response.status)
      .catch((err) => 500);
    if (blobUploadResult !== 201) {
      return { status: 'error', message: 'blob upload failed', redirect: null, lastModified: Date.now() };
    }
    const [note, draft] = await prisma
      .$transaction([
        prisma.note.create({
          data: {
            id: noteId,
            userId: user.id,
            title: title,
            groupId: groupId,
            Topics: {
              create: topics.map((topic) => ({ topicId: topic, order: topics.indexOf(topic) })),
            },
            bodyBlobName: blobName,
          },
        }),
        prisma.draft.delete({ where: { id: draftId } }),
      ])
      .catch((err) => [null, null]);

    if (!note) {
      await blob.delete('notes', blobName).catch((err) => null);
      return { status: 'error', message: 'note create failed', redirect: null, lastModified: Date.now() };
    }
    return { status: 'success', message: null, redirect: `/notes/${note.id}`, lastModified: Date.now() };
  }
}
