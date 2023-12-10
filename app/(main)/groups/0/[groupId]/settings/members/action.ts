'use server';

import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { revalidatePath } from 'next/cache';

export async function addMemberToGroup(groupId: string, userId: string, role: 'ADMIN' | 'CONTRIBUTOR' | 'READER') {
  const session = await auth();
  const { status, userId: sessionUserId, error } = await getUserIdFromSession(session, true);
  if (!sessionUserId) throw new Error('Unauthorized');

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      Members: true,
    },
  });
  if (!group) {
    throw new Error('Group not found');
  }

  if (group.Members.find((member) => member.userId === sessionUserId)?.role !== 'ADMIN') {
    throw new Error('You must be the owner of the group to add a member');
  }

  const member = await prisma.membership.create({
    data: {
      userId,
      groupId,
      role,
    },
  });
  revalidatePath(`/groups/0/${groupId}/settings/members`);
  return member;
}

export async function updateMemberRole(groupId: string, userId: string, role: 'ADMIN' | 'CONTRIBUTOR' | 'READER') {
  const session = await auth();
  const { status, userId: sessionUserId, error } = await getUserIdFromSession(session, true);
  if (!sessionUserId) throw new Error('Unauthorized');

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      Members: true,
    },
  });
  if (!group) {
    throw new Error('Group not found');
  }

  if (group.Members.find((member) => member.userId === sessionUserId)?.role !== 'ADMIN') {
    throw new Error('You must be the owner of the group to add a member');
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
  });
  revalidatePath(`/groups/0/${groupId}/settings/members`);
  return member;
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  const session = await auth();
  const { status, userId: sessionUserId, error } = await getUserIdFromSession(session, true);
  if (!sessionUserId) throw new Error('Unauthorized');

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      Members: true,
    },
  });
  if (!group) {
    throw new Error('Group not found');
  }

  if (group.Members.find((member) => member.userId === sessionUserId)?.role !== 'ADMIN') {
    throw new Error('You must be the owner of the group to add a member');
  }

  const member = await prisma.$transaction(async (prisma) => {
    const userToDelete = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!userToDelete) throw new Error('User not found');

    if (userToDelete.role === 'ADMIN') {
      const admins = await prisma.membership.findMany({
        where: {
          groupId,
          role: 'ADMIN',
        },
      });
      if (admins.length === 1) {
        throw new Error('Cannot remove the last admin');
      }
    }
    return prisma.membership.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });
  });
  revalidatePath(`/groups/0/${groupId}/settings/members`);
  return member;
}
