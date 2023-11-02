'server-only';

import prisma from '@/prisma/instance';

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

export function checkUserExists(userId: string) {
  return prisma.user
    .findUnique({
      select: { id: true },
      where: { id: userId },
    })
    .then((user) => !!user)
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user');
    });
}

export function getUserProfile(userId: string) {
  return prisma.user
    .findUnique({
      select: {
        id: true,
        handle: true,
        name: true,
        about: true,
      },
      where: { id: userId },
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
        UserSetting: {
          select: {
            styleNotesView: true,
          },
        },
      },
      where: { id: userId },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user');
    });
}
