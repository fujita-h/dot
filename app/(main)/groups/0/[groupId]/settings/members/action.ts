'use server';

import { checkAccountAuthorization, getSessionUser } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { revalidatePath } from 'next/cache';

export async function addMemberToGroup(groupId: string, userId: string, role: 'ADMIN' | 'CONTRIBUTOR' | 'READER') {
  const targetUserId = userId;

  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }

  const isAuthorized = await checkAccountAuthorization(user.id).catch(() => false);
  if (!isAuthorized) {
    revalidatePath('/settings/general');
    return { error: 'Unauthorized' };
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      Members: true,
    },
  });
  if (!group) {
    return { error: 'Group not found' };
  }

  if (group.Members.find((member) => member.userId === user.id)?.role !== 'ADMIN') {
    return { error: 'You must be the owner of the group to add a member' };
  }

  const member = await prisma.membership.create({
    data: {
      userId: targetUserId,
      groupId,
      role,
    },
    select: { userId: true, groupId: true, role: true },
  });
  revalidatePath(`/groups/0/${groupId}/settings/members`);
  return member;
}

export async function updateMemberRole(groupId: string, userId: string, role: 'ADMIN' | 'CONTRIBUTOR' | 'READER') {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      Members: true,
    },
  });
  if (!group) {
    return { error: 'Group not found' };
  }

  if (group.Members.find((member) => member.userId === user.id)?.role !== 'ADMIN') {
    return { error: 'You must be the owner of the group to add a member' };
  }

  const member = await prisma.membership.update({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
    data: {
      role,
    },
    select: { userId: true, groupId: true, role: true },
  });
  revalidatePath(`/groups/0/${groupId}/settings/members`);
  return member;
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      Members: true,
    },
  });
  if (!group) {
    return { error: 'Group not found' };
  }

  if (group.Members.find((member) => member.userId === user.id)?.role !== 'ADMIN') {
    return { error: 'You must be the owner of the group to add a member' };
  }

  const member = await prisma.$transaction(async (prisma) => {
    const userToDelete = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      select: { userId: true, groupId: true, role: true },
    });

    if (!userToDelete) {
      return { error: 'User not found in group' };
    }

    if (userToDelete.role === 'ADMIN') {
      const admins = await prisma.membership.findMany({
        where: {
          groupId,
          role: 'ADMIN',
        },
        select: { userId: true },
      });
      if (admins.length === 1) {
        return { error: 'Cannot remove the last admin' };
      }
    }
    return prisma.membership.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      select: { userId: true, groupId: true, role: true },
    });
  });
  revalidatePath(`/groups/0/${groupId}/settings/members`);
  return member;
}
