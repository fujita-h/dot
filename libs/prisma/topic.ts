'server-only';

import prisma from '@/libs/prisma/instance';

export function getTopics() {
  return prisma.topic
    .findMany({
      select: {
        id: true,
        handle: true,
        name: true,
      },
      orderBy: {
        handle: 'asc',
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching topics');
    });
}

export function getTopic(id: string) {
  return prisma.topic
    .findUnique({
      where: { id },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching topic');
    });
}

export function getTopicByHandle(handle: string) {
  return prisma.topic
    .findUnique({
      where: { handle },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching topic');
    });
}

export function getTopicWithFollowedByHandle(handle: string) {
  return prisma.topic
    .findUnique({
      where: { handle },
      include: { FollowedUsers: true },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching topic');
    });
}

export function getFollowingTopicsByUserId(userId: string) {
  return prisma.topic
    .findMany({
      where: {
        FollowedUsers: {
          some: {
            userId: userId,
          },
        },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching topics');
    });
}
