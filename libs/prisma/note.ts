'server-only';

import prisma from '@/libs/prisma/instance';

export function getNoteWithUserGroupTopics(noteId: string) {
  return prisma.note
    .findUnique({
      where: { id: noteId },
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
