'use server';

import { checkAccountAuthorization, getSessionUser } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { revalidatePath } from 'next/cache';

export interface ActionState {
  status: string | null;
  target: string | null;
  message: string | null;
  lastModified: number;
}

export async function updateUserSettingAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { status: 'error', target: null, message: 'Session error', lastModified: Date.now() };
  }

  const isAuthorized = await checkAccountAuthorization(user.id).catch(() => false);
  if (!isAuthorized) {
    revalidatePath('/settings/editor');
    return { status: 'error', target: null, message: 'Authorization error', lastModified: Date.now() };
  }

  try {
    await prisma.userSetting.update({
      where: { userId: user.id },
      data: {
        notificationOnCommentAdded: formData.get('notificationOnCommentAdded') === 'true',
      },
    });
    revalidatePath('/settings/editor');
    return { status: 'success', target: null, message: '更新が完了しました', lastModified: Date.now() };
  } catch (e) {
    console.error(e);
    return {
      status: 'error',
      target: null,
      message: 'Error occurred while updating user setting action',
      lastModified: Date.now(),
    };
  }
}
