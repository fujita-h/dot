'use server';

import { auth } from '@/libs/auth';
import { getRolesFromSession, getUserIdFromSession } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { checkHandle } from '@/libs/utils/check-handle';
import { init as initCuid } from '@paralleldrive/cuid2';
import { redirect } from 'next/navigation';

const cuid = initCuid({ length: 24 });

export interface ActionState {
  status: string | null;
  target: string | null;
  message: string | null;
  lastModified: number;
}

export async function addTopicAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  const roles = await getRolesFromSession(session);

  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (status !== 200 || !userId) {
    return { status: 'error', target: null, message: 'Session error', lastModified: Date.now() };
  }

  if (!roles.includes('Topic.Admin')) {
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

  const [topic, prismaError] = await prisma.topic
    .create({
      data: {
        id: cuid(),
        handle: formData.get('handle') as string,
        name: formData.get('name') as string,
      },
    })
    .then((topic) => {
      return [topic, null];
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
  if (!topic.handle) {
    return {
      status: 'error',
      target: null,
      message: 'Error occurred while creating group',
      lastModified: Date.now(),
    };
  }
  redirect(`/topics/0/${topic?.id}/settings`);
}
