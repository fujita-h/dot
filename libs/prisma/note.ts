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
