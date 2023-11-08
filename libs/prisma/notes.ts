'server-only';

import prisma from '@/prisma/instance';

export function getNote(noteId: string) {
  return prisma.note
    .findUnique({
      where: { id: noteId },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching note');
    });
}
