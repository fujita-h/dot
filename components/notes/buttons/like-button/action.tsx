'use server';

import { getSessionUser } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { getLiked, getLikedCount } from '@/libs/prisma/like';

export async function like(noteId: string) {
  const user = await getSessionUser();
  if (!user || !user.id) throw new Error('Unauthorized');
  const userId = user.id;

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
  const user = await getSessionUser();
  if (!user || !user.id) throw new Error('Unauthorized');
  const userId = user.id;

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
