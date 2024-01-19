'use server';

import { getSessionUser } from '@/libs/auth/utils';
import blob from '@/libs/azure/storeage-blob/instance';
import prisma from '@/libs/prisma/instance';
import { checkHandle } from '@/libs/utils/check-handle';
import { revalidatePath } from 'next/cache';

export interface ActionState {
  status: string | null;
  target: string | null;
  message: string | null;
  lastModified: number;
}

export async function updateUserAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || !user.id) {
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
      where: { id: user.id },
      data: {
        handle: formData.get('handle') as string,
        name: formData.get('name') as string,
        about: formData.get('about') as string,
      },
    });
    const image = formData.get('image') as File;
    if (image.size > 0 && image.type.startsWith('image/')) {
      await blob.upload('users', `${user.uid}/image`, image.type, Buffer.from(await image.arrayBuffer()));
    }
    const icon = formData.get('icon') as File;
    if (icon.size > 0 && icon.type.startsWith('image/')) {
      await blob.upload('users', `${user.uid}/icon`, icon.type, Buffer.from(await icon.arrayBuffer()));
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
