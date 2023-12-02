'server-only';

import prisma from '@/libs/prisma/instance';

export function getCommentsByNoteId(noteId: string, take?: number, skip?: number) {
  return prisma.comment
    .findMany({
      where: {
        noteId: noteId,
      },
      orderBy: { createdAt: 'asc' },
      take,
      skip,
      include: {
        User: true,
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching comments');
    });
}
