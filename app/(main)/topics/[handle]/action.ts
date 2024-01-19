'use server';

import { getSessionUser } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { revalidatePath } from 'next/cache';

export async function setFollow(topicId: string, follow: boolean): Promise<boolean> {
  const user = await getSessionUser();
  if (!user || !user.id) throw new Error('Unauthorized');
  const userId = user.id;

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) throw new Error('Group not found');

  const followed = await prisma.followTopic.findUnique({ where: { userId_topicId: { userId, topicId } } });
  if (follow && !followed) {
    const f = await prisma.followTopic
      .create({ data: { userId, topicId } })
      .then((data) => Boolean(data))
      .catch((e) => false);
    revalidatePath(`/topics/${topic.handle}`);
    return f;
  } else if (!follow && followed) {
    const f = await prisma.followTopic
      .delete({ where: { userId_topicId: { userId, topicId } } })
      .then((data) => Boolean(data))
      .catch((e) => false);
    revalidatePath(`/topics/${topic.handle}`);
    return f;
  }
  return Boolean(followed);
}
