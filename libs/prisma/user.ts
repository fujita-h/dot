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
