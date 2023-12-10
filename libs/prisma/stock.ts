'server-only';

import prisma from '@/libs/prisma/instance';

export function getStockedLabelsWithCount(userId: string) {
  return prisma.stockLabel
    .findMany({
      where: { userId },
      include: { _count: { select: { Stocks: true } } },
      orderBy: [{ default: 'desc' }, { name: 'asc' }],
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching userStockedNote');
    });
}

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

export function getStockedNotesCount(userId: string) {
  return prisma.stock
    .findMany({
      select: { noteId: true },
      where: { userId },
      distinct: ['noteId'],
    })
    .then((res) => res.length)
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching userStockedNote');
    });
}

export function getStockedNotesWithUserGroupTopicsByLabelId(
  userId: string,
  labelId: string | undefined,
  take?: number,
  skip?: number
) {
  return prisma.stock
    .findMany({
      where: {
        userId,
        labelId,
        Note: {
          OR: [
            { Group: null },
            { Group: { type: 'PUBLIC' } },
            { Group: { type: 'PRIVATE', Members: { some: { userId } } } },
          ],
        },
      },
      include: {
        Note: {
          include: {
            User: true,
            Group: true,
            Topics: { include: { Topic: true } },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      take,
      skip,
    })
    .then((res) => res.map((stock) => stock.Note))
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching userStockedNote');
    });
}
