'server-only';

import prisma from '@/libs/prisma/instance';

export function getNoteWithUserGroupTopics(noteId: string, requestUserId: string) {
  return prisma.note
    .findUnique({
      where: {
        id: noteId,
        OR: [
          { Group: null },
          {
            Group: {
              type: 'PUBLIC',
            },
          },
          {
            Group: {
              type: 'PRIVATE',
              Members: {
                some: {
                  userId: requestUserId,
                },
              },
            },
          },
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
