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
