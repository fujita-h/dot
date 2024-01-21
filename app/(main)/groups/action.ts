'use server';

import { getSessionUser } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { checkHandle } from '@/libs/utils/check-handle';
import { init as initCuid } from '@paralleldrive/cuid2';
import { GroupType } from '@prisma/client';
import { redirect } from 'next/navigation';

const cuid = initCuid({ length: 24 });

export interface ActionState {
  status: string | null;
  target: string | null;
  message: string | null;
  lastModified: number;
}

const USER_ROLE_FOR_GROUP_CREATION = process.env.USER_ROLE_FOR_GROUP_CREATION || '';

export async function createGroupAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { status: 'error', target: null, message: 'Session error', lastModified: Date.now() };
  }

  const roles = user.roles || [];

  if (USER_ROLE_FOR_GROUP_CREATION && !roles.includes(USER_ROLE_FOR_GROUP_CREATION)) {
    return { status: 'error', target: null, message: 'Permission denied', lastModified: Date.now() };
  }

  try {
    checkHandle(formData.get('handle') as string);
  } catch (e) {
    return {
      status: 'error',
      target: 'handle',
      message: 'handle は英字で始まり3文字以上である必要があります。利用可能は文字は英数字とハイフン(-)です。',
      lastModified: Date.now(),
    };
  }

  // Convert string to GroupType
  const type: GroupType = Object.values(GroupType).find((t) => t === formData.get('type')) || GroupType.PRIVATE;

  const [group, prismaError] = await prisma.group
    .create({
      data: {
        id: cuid(),
        handle: formData.get('handle') as string,
        name: formData.get('name') as string,
        about: (formData.get('about') as string) || '',
        type: type,
        Members: { create: { userId: user.id, role: 'ADMIN' } },
      },
    })
    .then((group) => {
      return [group, null];
    })
    .catch((e) => {
      return [null, e];
    });
  if (prismaError) {
    return {
      status: 'error',
      target: null,
      message: 'Error occurred while creating group',
      lastModified: Date.now(),
    };
  }
  if (!group.handle) {
    return {
      status: 'error',
      target: null,
      message: 'Error occurred while creating group',
      lastModified: Date.now(),
    };
  }
  redirect(`/groups/0/${group?.id}/settings`);
}
