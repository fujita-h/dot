'use server';

import prisma from '@/libs/prisma/instance';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { checkHandle } from '@/libs/utils/check-handle';
import { redirect } from 'next/navigation';
import { init as initCuid } from '@paralleldrive/cuid2';

const cuid = initCuid({ length: 24 });

export interface ActionState {
  status: string | null;
  target: string | null;
  message: string | null;
  lastModified: number;
}

export async function createGroupAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (status !== 200 || !userId) {
    return { status: 'error', target: null, message: 'Session error', lastModified: Date.now() };
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

  console.log(formData);
  const [group, prismaError] = await prisma.group
    .create({
      data: {
        id: cuid(),
        handle: formData.get('handle') as string,
        name: formData.get('name') as string,
        about: (formData.get('about') as string) || '',
        Members: { create: { userId: userId, role: 'ADMIN' } },
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
  redirect(`/groups/${group?.handle}`);
}
