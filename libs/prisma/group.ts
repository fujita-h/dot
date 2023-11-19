'server-only';

import prisma from '@/libs/prisma/instance';

export function getGroups() {
  return prisma.group.findMany().catch((e) => {
    console.error(e);
    throw new Error('Error occurred while fetching groups');
  });
}

export function getJoinedGroups(userId: string) {
  return prisma.group
    .findMany({
      where: { Members: { some: { userId } } },
      orderBy: { handle: 'asc' },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching groups');
    });
}

export function getPostableGroups(userId: string) {
  return prisma.group
    .findMany({
      where: {
        OR: [
          { type: 'PUBLIC' },
          { type: 'PRIVATE', Members: { some: { userId, role: { in: ['ADMIN', 'CONTRIBUTOR'] } } } },
        ],
      },
      orderBy: { handle: 'asc' },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching groups');
    });
}

export function getGroupsWithRecentNotesCountHEAVY(days: number, take?: number, skip?: number) {
  return prisma.group
    .findMany({
      include: {
        _count: {
          select: { Notes: { where: { releasedAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } } } },
        },
      },
      orderBy: [{ Notes: { _count: 'desc' } }, { createdAt: 'asc' }],
      take,
      skip,
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching groups');
    });
}

export function getGroupFromHandle(handle: string) {
  return prisma.group.findUnique({ where: { handle } }).catch((e) => {
    console.error(e);
    throw new Error('Error occurred while fetching group');
  });
}

export function getGroupFromHandleWithMembers(handle: string) {
  return prisma.group
    .findUnique({
      where: { handle },
      include: {
        Members: {
          include: { User: true },
          orderBy: { role: 'desc' },
        },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching group');
    });
}
