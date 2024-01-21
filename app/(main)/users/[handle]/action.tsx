'use server';

import { getSessionUser } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { revalidatePath } from 'next/cache';

export async function setFollow(userId: string, follow: boolean) {
  const user = await getSessionUser();
  if (!user || !user.id) throw new Error('Unauthorized');

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new Error('Not Found');

  const followed = await prisma.followUser.findUnique({
    where: { fromUserId_toUserId: { fromUserId: user.id, toUserId: userId } },
  });
  if (follow && !followed) {
    const f = await prisma.followUser
      .create({ data: { fromUserId: user.id, toUserId: userId } })
      .then((data) => Boolean(data))
      .catch((e) => false);
    revalidatePath(`/users/${targetUser.handle}`);
    return f;
  } else if (!follow && followed) {
    const f = await prisma.followUser
      .delete({ where: { fromUserId_toUserId: { fromUserId: user.id, toUserId: userId } } })
      .then((data) => Boolean(data))
      .catch((e) => false);
    revalidatePath(`/users/${targetUser.handle}`);
    return f;
  }
  return Boolean(followed);
}
