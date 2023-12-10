'server-only';

import prisma from '@/libs/prisma/instance';

export function getLiked(userId: string, noteId: string) {
  return prisma.like.findUnique({ where: { userId_noteId: { userId, noteId } } }).catch((e) => {
    console.error(e);
    throw new Error('Error occurred while fetching userStockedNote');
  });
}

export function getLikedCount(noteId: string) {
  return prisma.like.count({ where: { noteId } }).catch((e) => {
    console.error(e);
    throw new Error('Error occurred while fetching userStockedNote');
  });
}
