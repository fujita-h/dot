'use server';

import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { revalidatePath } from 'next/cache';

export async function setFollow(userId: string, follow: boolean) {
  const session = await auth();
  const { status, userId: sessionUserId, error } = await getUserIdFromSession(session, true);
  if (!sessionUserId) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Not Found');

  const followed = await prisma.followUser.findUnique({
    where: { fromUserId_toUserId: { fromUserId: sessionUserId, toUserId: userId } },
  });
  if (follow && !followed) {
    const f = await prisma.followUser
      .create({ data: { fromUserId: sessionUserId, toUserId: userId } })
      .then((data) => Boolean(data))
      .catch((e) => false);
    revalidatePath(`/users/${user.handle}`);
    return f;
  } else if (!follow && followed) {
    const f = await prisma.followUser
      .delete({ where: { fromUserId_toUserId: { fromUserId: sessionUserId, toUserId: userId } } })
      .then((data) => Boolean(data))
      .catch((e) => false);
    revalidatePath(`/users/${user.handle}`);
    return f;
  }
  return Boolean(followed);
}
