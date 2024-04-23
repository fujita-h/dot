'server-only';

import prisma from '@/libs/prisma/instance';

export function getNotifications(userId: string) {
  return prisma.notification
    .findMany({
      where: {
        userId,
      },
      include: {
        NotificationComment: {
          include: {
            Comment: {
              select: {
                id: true,
                userId: true,
                noteId: true,
                isEdited: true,
                createdAt: true,
                updatedAt: true,
                User: {
                  select: { uid: true, name: true },
                },
                Note: {
                  select: { id: true, title: true },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching notifications');
    });
}
