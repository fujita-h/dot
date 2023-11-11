'use server';

import prisma from '@/libs/prisma/instance';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { revalidatePath } from 'next/cache';

export async function deleteDraft(draftId: string): Promise<boolean> {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (!userId) throw new Error('Unauthorized');

  const draft = await prisma.draft.delete({ where: { id: draftId } }).catch((e) => {
    console.error(e);
    return null;
  });
  revalidatePath('/drafts', 'page');

  // TODO: we should return object to notify detail of error
  return Boolean(draft);
}
