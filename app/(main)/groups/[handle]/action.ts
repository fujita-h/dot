'use server';

import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { revalidatePath } from 'next/cache';

export async function setFollow(groupId: string, follow: boolean): Promise<boolean> {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (!userId) throw new Error('Unauthorized');

  const group = await prisma.group.findUnique({ where: { id: groupId }, include: { Members: true } });
  if (!group) throw new Error('Group not found');
  if (group.type === 'PRIVATE' && !group.Members.find((m) => m.userId === userId)) throw new Error('Unauthorized');

  const followed = await prisma.followGroup.findUnique({ where: { userId_groupId: { userId, groupId } } });
  if (follow && !followed) {
    const f = await prisma.followGroup
      .create({ data: { userId, groupId } })
      .then((data) => Boolean(data))
      .catch((e) => false);
    revalidatePath(`/groups/${group.handle}`);
    return f;
  } else if (!follow && followed) {
    const f = await prisma.followGroup
      .delete({ where: { userId_groupId: { userId, groupId } } })
      .then((data) => Boolean(data))
      .catch((e) => false);
    revalidatePath(`/groups/${group.handle}`);
    return f;
  }
  return Boolean(followed);
}
