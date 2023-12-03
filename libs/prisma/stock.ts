'server-only';

import prisma from '@/libs/prisma/instance';

export function getStockedNoteLabels(userId: string, noteId: string) {
  return prisma.stock
    .findMany({
      where: { userId, noteId },
      include: { Label: true },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching userStockedNote');
    });
}

export function getLabels(userId: string) {
  return prisma.stockLabel
    .findMany({
      where: { userId },
      orderBy: [{ default: 'desc' }, { name: 'asc' }],
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching userStockedNote');
    });
}

export function getStockedUsersCount(noteId: string) {
  return prisma.stock
    .findMany({
      select: { userId: true },
      where: { noteId },
      distinct: ['userId'],
    })
    .then((res) => res.length)
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching userStockedNote');
    });
}
