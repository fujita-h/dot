'server-only';

import prisma from '@/libs/prisma/instance';

export function getUserSetting(userId: string) {
  return getUserSettingCreateIfNotExists(userId);
}

function getUserSettingCreateIfNotExists(userId: string) {
  return prisma.userSetting
    .upsert({
      where: { userId },
      update: {},
      create: {
        userId,
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user setting');
    });
}

export function getEditorAiCompletionPrompt(userId: string) {
  return prisma.userSetting
    .findUnique({
      where: { userId },
      select: { editorAiCompletionPrompt: true },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user setting');
    });
}
