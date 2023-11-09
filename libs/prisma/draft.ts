'server-only';

import prisma from '@/libs/prisma/instance';

export function createDraft(userId: string) {
  return prisma.draft
    .create({
      data: {
        userId: userId,
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while creating draft');
    });
}

export function getDraft(userId: string, draftId: string) {
  return prisma.draft
    .findUnique({
      where: { id: draftId, userId: userId },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching draft');
    });
}

export function getDraftWithTopics(userId: string, draftId: string) {
  return prisma.draft
    .findUnique({
      where: { id: draftId, userId: userId },
      include: { Topics: { include: { Topic: true } } },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching draft');
    });
}
