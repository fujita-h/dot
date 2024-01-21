'use server';

import { getSessionUser } from '@/libs/auth/utils';
import blob from '@/libs/azure/storeage-blob/instance';
import prisma from '@/libs/prisma/instance';
import { checkHandle } from '@/libs/utils/check-handle';
import { revalidatePath } from 'next/cache';

const USER_ROLE_FOR_TOPIC_CREATION = process.env.USER_ROLE_FOR_TOPIC_CREATION || '';

export interface ActionState {
  status: string | null;
  target: string | null;
  message: string | null;
  lastModified: number;
}

export async function UpdateTopicAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { status: 'error', target: null, message: 'Session error', lastModified: Date.now() };
  }

  const roles = user?.roles || [];

  if (USER_ROLE_FOR_TOPIC_CREATION && !roles.includes(USER_ROLE_FOR_TOPIC_CREATION)) {
    return { status: 'error', target: null, message: 'Permission denied', lastModified: Date.now() };
  }

  const topicId = formData.get('id') as string;
  if (!topicId) {
    return { status: 'error', target: null, message: 'Topic id not required', lastModified: Date.now() };
  }

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    return { status: 'error', target: null, message: 'Topic not found', lastModified: Date.now() };
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

  try {
    await prisma.topic.update({
      where: { id: topicId },
      data: {
        handle: formData.get('handle') as string,
        name: formData.get('name') as string,
      },
    });
    const icon = formData.get('icon') as File;
    if (icon.size > 0 && icon.type.startsWith('image/')) {
      await blob.upload('topics', `${topicId}/icon`, icon.type, Buffer.from(await icon.arrayBuffer()));
    }
    revalidatePath(`/topics/0/${topicId}/settings/general`);
    return { status: 'success', target: null, message: 'Update success', lastModified: Date.now() };
  } catch (e) {
    console.error(e);
    return { status: 'error', target: null, message: 'Update failed', lastModified: Date.now() };
  }
}
