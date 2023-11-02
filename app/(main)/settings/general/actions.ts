'use server';

import prisma from '@/prisma/instance';
import blob from '@/libs/azure/storeage-blob/instance';
import { revalidatePath } from 'next/cache';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/session';
import { checkHandle } from '@/libs/utils/check-handle';

export interface ActionState {
  status: string | null;
  target: string | null;
  message: string | null;
  lastModified: number;
}

export async function updateUserAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  const { status, userId: sessionUserId, error } = await getUserIdFromSession(session);
  if (status !== 200 || !sessionUserId) {
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
  try {
    await prisma.user.update({
      where: { id: sessionUserId },
      data: {
        handle: formData.get('handle') as string,
        name: formData.get('name') as string,
        about: formData.get('about') as string,
      },
    });
    const image = formData.get('image') as File;
    if (image.size > 0 && image.type.startsWith('image/')) {
      await blob.upload('user', `${sessionUserId}/image`, image.type, Buffer.from(await image.arrayBuffer()));
    }
    const icon = formData.get('icon') as File;
    if (icon.size > 0 && icon.type.startsWith('image/')) {
      await blob.upload('user', `${sessionUserId}/icon`, icon.type, Buffer.from(await icon.arrayBuffer()));
    }
    revalidatePath('/settings/general');
    return { status: 'success', target: null, message: '更新が完了しました', lastModified: Date.now() };
  } catch (e) {
    console.error(e);
    return {
      status: 'error',
      target: null,
      message: 'Error occurred while updating user action',
      lastModified: Date.now(),
    };
  }
}
