'server-only';

import blob from '@/libs/azure/storeage-blob/instance';
import prisma from '@/libs/prisma/instance';
import { init as initCuid } from '@paralleldrive/cuid2';

const cuid = initCuid({ length: 24 });

export async function createDraft(
  userId: string,
  {
    groupId,
    relatedNoteId,
    title,
    body,
    canPostComment,
    Topics,
    userName,
    oid,
  }: {
    groupId?: string;
    relatedNoteId?: string;
    title?: string;
    body?: string;
    canPostComment?: boolean;
    Topics?: { Topic: { id: string }; order: number }[];
    userName?: string;
    oid?: string;
  } = {}
) {
  const draftId = cuid();
  let blobName = undefined;

  if (body) {
    const metadata = {
      userId: userId,
      groupId: groupId || 'n/a',
      userName: userName ? encodeURI(userName) : 'n/a',
      oid: oid || '',
    };
    const tags = {
      userId: userId,
      groupId: groupId || 'n/a',
      oid: oid || 'n/a',
    };
    blobName = `${draftId}/${cuid()}`;
    const blobUploadResult = await blob
      .upload('drafts', blobName, 'text/markdown', body, metadata, tags)
      .then((res) => res._response.status)
      .catch((err) => 500);

    if (blobUploadResult !== 201) {
      throw new Error('Error occurred while creating draft blob');
    }
  }

  return prisma.draft
    .create({
      data: {
        id: draftId,
        userId: userId,
        groupId: groupId,
        relatedNoteId: relatedNoteId,
        title: title,
        bodyBlobName: blobName,
        canPostComment: canPostComment,
        Topics: {
          create: Topics?.map((topic) => ({ topicId: topic.Topic.id, order: topic.order })),
        },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while creating draft');
    });
}

// if you change this function, you should change getDraftsCount too
export function getDraftsWithGroupTopic(userId: string, take?: number, skip?: number) {
  return prisma.draft
    .findMany({
      where: { userId: userId },
      orderBy: { updatedAt: 'desc' },
      take: take,
      skip: skip,
      include: {
        Group: true,
        Topics: { include: { Topic: true } },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching drafts');
    });
}

// if you change this function, you should change getDraftsWithGroupTopic too
export function getDraftsCount(userId: string) {
  return prisma.draft.count({ where: { userId: userId } }).catch((e) => {
    console.error(e);
    throw new Error('Error occurred while fetching drafts');
  });
}

export function getDraft(userId: string, draftId: string) {
  return prisma.draft
    .findUnique({
      where: { id: draftId, userId: userId },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching draft');
    });
}

export function getDraftWithGroupTopics(userId: string, draftId: string) {
  return prisma.draft
    .findUnique({
      where: { id: draftId, userId: userId },
      include: {
        Group: true,
        Topics: { include: { Topic: true }, orderBy: { order: 'asc' } },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching draft');
    });
}
