'server-only';

import blob from '@/libs/azure/storeage-blob/instance';
import prisma from '@/libs/prisma/instance';
import { init as initCuid } from '@paralleldrive/cuid2';
import { checkPostableGroup } from './group';

const cuid = initCuid({ length: 24 });

/**
 * Creates a draft with the specified properties.
 *
 * @param authorizedRequestUserId - The ID of the user creating the draft. This userID must match the ID of the authorized user.
 * @param options - The optional properties for the draft.
 * @param options.groupId - The ID of the group the draft belongs to.
 * @param options.relatedNoteId - The ID of the related note.
 * @param options.title - The title of the draft.
 * @param options.body - The body of the draft.
 * @param options.canPostComment - Indicates whether the user can post comments on the draft.
 * @param options.Topics - An array of topics associated with the draft.
 * @param options.Topics[].Topic.id - The ID of the topic.
 * @param options.Topics[].order - The order of the topic.
 * @param options.userName - The username of the user.
 * @param options.oid - The OID of the draft.
 * @param options.uid - The UID of the draft.
 * @returns A promise that resolves to the created draft.
 * @throws If the user cannot post to the group or an error occurs while creating the draft.
 */
export async function createDraft(
  authorizedRequestUserId: string,
  {
    groupId,
    relatedNoteId,
    title,
    body,
    canPostComment,
    Topics,
    userName,
    oid,
    uid,
  }: {
    groupId?: string;
    relatedNoteId?: string;
    title?: string;
    body?: string;
    canPostComment?: boolean;
    Topics?: { Topic: { id: string }; order: number }[];
    userName?: string;
    oid?: string;
    uid?: string;
  } = {}
) {
  //check if user can post to the group
  if (groupId) {
    const check = checkPostableGroup(authorizedRequestUserId, groupId);
    if (!check) {
      throw new Error('User cannot post to the group');
    }
  }

  const draftId = cuid();
  let blobName = undefined;

  if (body) {
    const metadata = {
      userId: authorizedRequestUserId,
      groupId: groupId || 'n/a',
      userName: userName ? encodeURI(userName) : 'n/a',
      oid: oid || '',
      uid: uid || '',
    };
    const tags = {
      userId: authorizedRequestUserId,
      groupId: groupId || 'n/a',
      oid: oid || 'n/a',
      uid: uid || 'n/a',
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
        userId: authorizedRequestUserId,
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
      where: {
        userId: userId,
      },
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
  return prisma.draft
    .count({
      where: {
        userId: userId,
      },
    })
    .catch((e) => {
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
