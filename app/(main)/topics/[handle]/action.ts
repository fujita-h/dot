'use server';

import { getSessionUser } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { revalidatePath } from 'next/cache';

export async function setFollow(topicId: string, follow: boolean) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }
  const userId = user.id;

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    return { error: 'Topic not found' };
  }

  const followed = await prisma.followTopic.findUnique({
    where: { userId_topicId: { userId, topicId } },
    select: { userId: true, topicId: true },
  });
  if (follow && !followed) {
    const f = await prisma.followTopic
      .create({ data: { userId, topicId }, select: { userId: true, topicId: true } })
      .catch((e) => null);
    revalidatePath(`/topics/${topic.handle}`);
    return f;
  } else if (!follow && followed) {
    const f = await prisma.followTopic
      .delete({ where: { userId_topicId: { userId, topicId } }, select: { userId: true, topicId: true } })
      .catch((e) => null);
    revalidatePath(`/topics/${topic.handle}`);
    return f;
  }
  return followed;
}
