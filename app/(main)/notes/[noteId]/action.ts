'use server';

import { getSessionUser } from '@/libs/auth/utils';
import blob from '@/libs/azure/storeage-blob/instance';
import es from '@/libs/elasticsearch/instance';
import prisma from '@/libs/prisma/instance';
import { init as initCuid } from '@paralleldrive/cuid2';
import { revalidatePath } from 'next/cache';

const cuid = initCuid();

export async function deleteNote(noteId: string) {
  const user = await getSessionUser();
  if (!user || !user.id) throw new Error('Unauthorized');

  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
    },
  });

  if (note?.userId !== user.id) {
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

export async function commentOnNote(noteId: string, comment: string) {
  const user = await getSessionUser();
  if (!user || !user.id) throw new Error('Unauthorized');
  const userId = user.id;

  const metadata = {
    userId: userId,
    noteId: noteId,
  };
  const tags = {
    userId: userId,
    noteId: noteId,
  };
  const blobName = `${noteId}/${cuid()}`;
  const blobUploadResult = await blob
    .upload('comments', blobName, 'text/markdown', comment, metadata, tags)
    .then((res) => res._response.status)
    .catch((err) => 500);

  if (blobUploadResult !== 201) {
    throw new Error('Failed to upload comment');
  }

  const result = await prisma.comment.create({
    data: {
      id: cuid(),
      noteId: noteId,
      userId: userId,
      bodyBlobName: blobName,
      isEdited: false,
    },
  });
  if (result) {
    revalidatePath(`/notes/${noteId}`);
  }
  return result;
}
