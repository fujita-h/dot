'use server';

import { getSessionUser } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { revalidatePath } from 'next/cache';

export async function deleteDraft(draftId: string): Promise<boolean> {
  const user = await getSessionUser();
  if (!user || !user.id) throw new Error('Unauthorized');

  const draft = await prisma.draft.delete({ where: { id: draftId } }).catch((e) => {
    console.error(e);
    return null;
  });
  revalidatePath('/drafts', 'page');

  // TODO: we should return object to notify detail of error
  return Boolean(draft);
}
