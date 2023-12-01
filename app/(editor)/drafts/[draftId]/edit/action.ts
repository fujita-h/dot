'use server';

import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import blob from '@/libs/azure/storeage-blob/instance';
import es from '@/libs/elasticsearch/instance';
import prisma from '@/libs/prisma/instance';
import { getUserWithClaims } from '@/libs/prisma/user';
import { init as initCuid } from '@paralleldrive/cuid2';

const cuid = initCuid({ length: 24 });

export interface ActionState {
  submit: string | null;
  status: string | null;
  message: string | null;
  redirect: string | null;
  lastModified: number;
}

export async function action(state: ActionState, formData: FormData): Promise<ActionState> {
  const submit = state.submit;
  const session = await auth();
  const { userId } = await getUserIdFromSession(session);
  if (!userId) {
    return { submit: submit, status: 'error', message: 'not authorized', redirect: null, lastModified: Date.now() };
  }
  const user = await getUserWithClaims(userId);
  if (!user) {
    return { submit: submit, status: 'error', message: 'user not found', redirect: null, lastModified: Date.now() };
  }

  const draftId = formData.get('draftId') as string;
  const groupId = (formData.get('groupId') as string) || undefined;
  const relatedNoteId = (formData.get('relatedNoteId') as string) || undefined;
  const title = formData.get('title') as string;
  const topics = formData.getAll('topics') as string[];
  const body = formData.get('body') as string;

  if (!draftId) {
    return { submit: submit, status: 'error', message: 'invalid draft id', redirect: null, lastModified: Date.now() };
  }

  // check group
  if (groupId) {
    const group = await prisma.group
      .findUnique({
        where: {
          id: groupId,
          OR: [
            { type: 'PUBLIC' },
            { type: 'PRIVATE', Members: { some: { userId: user.id, role: { in: ['ADMIN', 'CONTRIBUTOR'] } } } },
          ],
        },
      })
      .catch((err) => null);
    if (!group) {
      return { submit: submit, status: 'error', message: 'invalid group id', redirect: null, lastModified: Date.now() };
    }
  }

  switch (submit) {
    case 'autosave':
      return processAutoSave(user, draftId, groupId, relatedNoteId, title, topics, body);
    case 'draft':
      return processDraft(user, draftId, groupId, relatedNoteId, title, topics, body);
    case 'publish':
      return processPublish(user, draftId, groupId, relatedNoteId, title, topics, body);
    default:
      return { submit: null, status: 'error', message: 'invalid submit', redirect: null, lastModified: Date.now() };
  }
}

async function processAutoSave(
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

  const blobName = await prisma.draft
    .findUnique({ where: { id: draftId, userId: user.id } })
    .then((draft) => draft?.bodyBlobName)
    .catch((err) => null);

  if (!blobName) {
    return {
      submit: 'autosave',
      status: 'error',
      message: 'draft blob not found',
      redirect: null,
      lastModified: Date.now(),
    };
  }

  const blobUploadResult = await blob
    .upload('drafts', blobName, 'text/markdown', body, metadata, tags)
    .then((res) => res._response.status)
    .catch((err) => 500);

  if (blobUploadResult !== 201) {
    return {
      submit: 'autosave',
      status: 'error',
      message: 'blob upload failed',
      redirect: null,
      lastModified: Date.now(),
    };
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
    return {
      submit: 'autosave',
      status: 'error',
      message: 'draft update failed',
      redirect: null,
      lastModified: Date.now(),
    };
  }

  return {
    submit: 'autosave',
    status: 'success',
    message: null,
    redirect: `/drafts?id=${draft.id}`,
    lastModified: Date.now(),
  };
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
    .upload('drafts', blobName, 'text/markdown', body, metadata, tags)
    .then((res) => res._response.status)
    .catch((err) => 500);

  if (blobUploadResult !== 201) {
    return {
      submit: 'draft',
      status: 'error',
      message: 'blob upload failed',
      redirect: null,
      lastModified: Date.now(),
    };
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
    return {
      submit: 'draft',
      status: 'error',
      message: 'draft update failed',
      redirect: null,
      lastModified: Date.now(),
    };
  }

  return {
    submit: 'draft',
    status: 'success',
    message: null,
    redirect: `/drafts?id=${draft.id}`,
    lastModified: Date.now(),
  };
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

  if (relatedNoteId) {
    // update note
    const blobName = `${relatedNoteId}/${cuid()}`;
    const blobUploadResult = await blob
      .upload('notes', blobName, 'text/markdown', body, metadata, tags)
      .then((res) => res._response.status)
      .catch((err) => 500);
    if (blobUploadResult !== 201) {
      return {
        submit: 'publish',
        status: 'error',
        message: 'blob upload failed',
        redirect: null,
        lastModified: Date.now(),
      };
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
          User: { select: { handle: true, name: true } },
          Group: { select: { handle: true, name: true, type: true } },
          Topics: { select: { topicId: true, Topic: { select: { handle: true, name: true } }, order: true } },
        },
      });
      tx.draft.delete({ where: { id: draftId } });
      es.create('notes', note.id, { ...note, body });
      return note;
    });

    if (!note) {
      await blob.delete('notes', blobName).catch((err) => null);
      return {
        submit: 'publish',
        status: 'error',
        message: 'note update failed',
        redirect: null,
        lastModified: Date.now(),
      };
    }
    return {
      submit: 'publish',
      status: 'success',
      message: null,
      redirect: `/notes/${note.id}`,
      lastModified: Date.now(),
    };
  } else {
    // create note
    const noteId = cuid();
    const blobName = `${noteId}/${cuid()}`;
    const blobUploadResult = await blob
      .upload('notes', blobName, 'text/markdown', body, metadata, tags)
      .then((res) => res._response.status)
      .catch((err) => 500);
    if (blobUploadResult !== 201) {
      return {
        submit: 'publish',
        status: 'error',
        message: 'blob upload failed',
        redirect: null,
        lastModified: Date.now(),
      };
    }
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
      es.create('notes', note.id, { ...note, body });
      return note;
    });

    if (!note) {
      await blob.delete('notes', blobName).catch((err) => null);
      return {
        submit: 'publish',
        status: 'error',
        message: 'note create failed',
        redirect: null,
        lastModified: Date.now(),
      };
    }
    return {
      submit: 'publish',
      status: 'success',
      message: null,
      redirect: `/notes/${note.id}`,
      lastModified: Date.now(),
    };
  }
}
