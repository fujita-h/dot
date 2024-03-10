'use server';

import { getSessionUser } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { GroupType, MembershipRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function setFollow(groupId: string, follow: boolean) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }
  const userId = user.id;

  const group = await prisma.group.findUnique({ where: { id: groupId }, include: { Members: true } });
  if (!group) {
    return { error: 'Group not found' };
  }
  if (group.type === GroupType.PRIVATE && !group.Members.find((m) => m.userId === userId)) {
    return { error: 'Unauthorized' };
  }

  const followed = await prisma.followGroup.findUnique({
    where: { userId_groupId: { userId, groupId } },
    select: { userId: true, groupId: true },
  });
  if (follow && !followed) {
    const f = await prisma.followGroup
      .create({
        data: { userId, groupId },
        select: { userId: true, groupId: true },
      })
      .catch((e) => false);
    revalidatePath(`/groups/${group.handle}`);
    return f;
  } else if (!follow && followed) {
    const f = await prisma.followGroup
      .delete({
        where: { userId_groupId: { userId, groupId } },
        select: { userId: true, groupId: true },
      })
      .catch((e) => false);
    revalidatePath(`/groups/${group.handle}`);
    return f;
  }
  return followed;
}

export async function joinCommunity(groupId: string, join: boolean) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }
  const userId = user.id;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { Members: { select: { userId: true, groupId: true, role: true } } },
  });
  if (!group) {
    return { error: 'Group not found' };
  }
  if (group.type !== GroupType.COMMUNITY) {
    return { error: 'This group is not a community' };
  }

  const myMembership = group.Members.find((m) => m.userId === userId);
  if (myMembership && myMembership.role === 'ADMIN') {
    return { error: 'Admins cannot join/leave the group using this method' };
  }

  if (join && !myMembership) {
    const f = await prisma.membership
      .create({
        data: { userId, groupId, role: MembershipRole.CONTRIBUTOR },
        select: { userId: true, groupId: true, role: true },
      })
      .catch((e) => false);
    revalidatePath(`/groups/${group.handle}`);
    return f;
  } else if (!join && myMembership) {
    const f = await prisma.membership
      .delete({
        where: { userId_groupId: { userId, groupId } },
        select: { userId: true, groupId: true, role: true },
      })
      .catch((e) => false);
    revalidatePath(`/groups/${group.handle}`);
    return f;
  } else {
    revalidatePath(`/groups/${group.handle}`);
    return myMembership;
  }
}
