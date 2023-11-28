'server-only';

import prisma from '@/libs/prisma/instance';

export function getNoteWithUserGroupTopics(noteId: string, requestUserId: string) {
  return prisma.note
    .findUnique({
      where: {
        id: noteId,
        OR: [
          { Group: null },
          { Group: { type: 'PUBLIC' } },
          { Group: { type: 'PRIVATE', Members: { some: { userId: requestUserId } } } },
        ],
      },
      include: {
        User: true,
        Group: true,
        Topics: { include: { Topic: true } },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching note');
    });
}

export function getNotesWithUserGroupTopics(requestUserId: string, take?: number, skip?: number) {
  return prisma.note
    .findMany({
      where: {
        userId: requestUserId,
        OR: [
          { Group: null },
          { Group: { type: 'PUBLIC' } },
          { Group: { type: 'PRIVATE', Members: { some: { userId: requestUserId } } } },
        ],
      },
      orderBy: { releasedAt: 'desc' },
      take,
      skip,
      include: {
        User: true,
        Group: true,
        Topics: { include: { Topic: true } },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching notes');
    });
}

export function getNotesWithUserGroupTopicsByGroupId(groupId: string, take?: number, skip?: number) {
  return prisma.note
    .findMany({
      where: { Group: { id: groupId } },
      orderBy: { releasedAt: 'desc' },
      take,
      skip,
      include: {
        User: true,
        Group: true,
        Topics: { include: { Topic: true } },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching notes');
    });
}

export function getNotesWithUserGroupTopicsByTopicId(
  topicId: string,
  requestUserId: string,
  take?: number,
  skip?: number
) {
  return prisma.note
    .findMany({
      where: {
        Topics: { some: { topicId } },
        OR: [
          { Group: null },
          { Group: { type: 'PUBLIC' } },
          { Group: { type: 'PRIVATE', Members: { some: { userId: requestUserId } } } },
        ],
      },
      orderBy: { releasedAt: 'desc' },
      take,
      skip,
      include: {
        User: true,
        Group: true,
        Topics: { include: { Topic: true } },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching notes');
    });
}

export function getNotesCountByGroupId(groupId: string) {
  return prisma.note
    .count({
      where: { Group: { id: groupId } },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching notes');
    });
}

export function getTimelineNotesWithUserGroupTopics(userId: string, take?: number, skip?: number) {
  return prisma.note.findMany({
    where: {
      AND: [
        {
          OR: [
            { Group: null },
            { Group: { type: 'PUBLIC' } },
            { Group: { type: 'PRIVATE', Members: { some: { userId } } } },
          ],
        },
        {
          OR: [
            { User: { FollowingUsers: { some: { fromUserId: userId } } } },
            { Group: { FollowedUsers: { some: { userId } } } },
            { Topics: { some: { Topic: { FollowedUsers: { some: { userId } } } } } },
          ],
        },
      ],
    },
    orderBy: { releasedAt: 'desc' },
    include: {
      User: true,
      Group: true,
      Topics: { include: { Topic: true } },
    },
    take,
    skip,
  });
}
