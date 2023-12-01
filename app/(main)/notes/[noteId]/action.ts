'use server';

import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import es from '@/libs/elasticsearch/instance';
import prisma from '@/libs/prisma/instance';
import { revalidatePath } from 'next/cache';

export async function deleteNote(noteId: string) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (!userId) throw new Error('Unauthorized');

  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
    },
  });

  if (note?.userId !== userId) {
    throw new Error('Unauthorized');
  }

  const result = await prisma.$transaction(async (tx) => {
    await es.delete('notes', noteId, [404]);
    const note = await tx.note.delete({
      where: {
        id: noteId,
      },
    });
    return note;
  });
  if (result) {
    revalidatePath(`/notes/${noteId}`);
  }
  return result;
}
