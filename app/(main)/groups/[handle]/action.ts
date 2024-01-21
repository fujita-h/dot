'use server';

import { getSessionUser } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { GroupType, MembershipRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function setFollow(groupId: string, follow: boolean): Promise<boolean> {
  const user = await getSessionUser();
  if (!user || !user.id) throw new Error('Unauthorized');
  const userId = user.id;

  const group = await prisma.group.findUnique({ where: { id: groupId }, include: { Members: true } });
  if (!group) throw new Error('Group not found');
  if (group.type === GroupType.PRIVATE && !group.Members.find((m) => m.userId === userId)) {
    throw new Error('Unauthorized');
  }

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

export async function joinCommunity(groupId: string, join: boolean): Promise<boolean> {
  const user = await getSessionUser();
  if (!user || !user.id) throw new Error('Unauthorized');
  const userId = user.id;

  const group = await prisma.group.findUnique({ where: { id: groupId }, include: { Members: true } });
  if (!group) throw new Error('Group not found');
  if (group.type !== GroupType.COMMUNITY) {
    throw new Error('This group is not a community');
  }

  const myMembership = group.Members.find((m) => m.userId === userId);
  if (myMembership && myMembership.role === 'ADMIN') {
    throw new Error('Admins cannot join/leave the group using this method');
  }

  if (join && !myMembership) {
    const f = await prisma.membership
      .create({ data: { userId, groupId, role: MembershipRole.CONTRIBUTOR } })
      .then((data) => Boolean(data))
      .catch((e) => false);
    revalidatePath(`/groups/${group.handle}`);
    return f;
  } else if (!join && myMembership) {
    const f = await prisma.membership
      .delete({ where: { userId_groupId: { userId, groupId } } })
      .then((data) => Boolean(data))
      .catch((e) => false);
    revalidatePath(`/groups/${group.handle}`);
    return f;
  } else {
    revalidatePath(`/groups/${group.handle}`);
    return Boolean(myMembership);
  }
}
