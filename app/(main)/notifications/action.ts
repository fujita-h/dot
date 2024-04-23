'use server';

import { getSessionUser } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { revalidatePath } from 'next/cache';

export async function markNotificationAsRead(notificationIds: string[]) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }
  const userId = user.id;

  const results = await Promise.allSettled(
    notificationIds.map((id) => {
      return prisma.notification.update({
        where: { id, userId },
        data: { status: 'READ' },
      });
    })
  );

  revalidatePath('/notifications');
  return results.filter((_, index) => results[index].status === 'fulfilled').map((result: any) => result.value?.id);
}

export async function markNotificationAsUnRead(notificationIds: string[]) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }
  const userId = user.id;

  const results = await Promise.allSettled(
    notificationIds.map((id) => {
      return prisma.notification.update({
        where: { id, userId },
        data: { status: 'UNREAD' },
      });
    })
  );

  revalidatePath('/notifications');
  return results.filter((_, index) => results[index].status === 'fulfilled').map((result: any) => result.value?.id);
}

export async function deleteNotification(notificationIds: string[]) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }
  const userId = user.id;

  const results = await Promise.allSettled(
    notificationIds.map((id) => {
      return prisma.notification.delete({
        where: { id, userId },
      });
    })
  );

  revalidatePath('/notifications');
  return results.filter((_, index) => results[index].status === 'fulfilled').map((result: any) => result.value?.id);
}
