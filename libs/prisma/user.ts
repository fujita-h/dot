'server-only';

import prisma from '@/libs/prisma/instance';

export function getUserId(userId: string) {
  return prisma.user
    .findUnique({
      select: { id: true },
      where: { id: userId },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user');
    });
}

export function getUser(userId: string) {
  return prisma.user
    .findUnique({
      where: { id: userId },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user');
    });
}

export function getUserFromHandle(handle: string) {
  return prisma.user
    .findUnique({
      where: { handle },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user');
    });
}

export function getUserWithFollowedFromHandle(handle: string) {
  return prisma.user
    .findUnique({
      where: { handle },
      include: {
        FollowedUsers: true,
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user');
    });
}

export function getUserWithClaims(userId: string) {
  return prisma.user
    .findUnique({
      where: { id: userId },
      include: {
        Claim: true,
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user');
    });
}

export function getUserProfileAndSettings(userId: string) {
  return prisma.user
    .findUnique({
      select: {
        id: true,
        handle: true,
        name: true,
        about: true,
        UserSetting: true,
      },
      where: { id: userId },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user');
    });
}

export function getUsersWithEmail(take?: number, skip?: number) {
  return prisma.user
    .findMany({
      include: { Claim: { select: { email: true } } },
      take,
      skip,
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching users');
    });
}

export function getFollowingUsersByUserId(userId: string) {
  return prisma.user
    .findMany({
      where: {
        FollowedUsers: {
          some: {
            fromUserId: userId,
          },
        },
      },
      orderBy: {
        handle: 'asc',
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching users');
    });
}
