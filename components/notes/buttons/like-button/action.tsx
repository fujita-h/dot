'use server';

import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { getLiked, getLikedCount } from '@/libs/prisma/like';

export async function like(noteId: string) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (!userId) throw new Error('Unauthorized');

  // create like if not exists
  await prisma.like.upsert({
    where: { userId_noteId: { userId, noteId } },
    create: { userId, noteId },
    update: {},
  });

  const [liked, count] = await Promise.all([
    getLiked(userId, noteId)
      .then((data) => !!data)
      .catch((e) => false),
    getLikedCount(noteId).catch((e) => 0),
  ]);
  return { liked, count };
}

export async function unLike(noteId: string) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (!userId) throw new Error('Unauthorized');

  // delete like if exists
  await prisma.like.delete({
    where: { userId_noteId: { userId, noteId } },
  });

  const [liked, count] = await Promise.all([
    getLiked(userId, noteId)
      .then((data) => !!data)
      .catch((e) => false),
    getLikedCount(noteId).catch((e) => 0),
  ]);
  return { liked, count };
}
