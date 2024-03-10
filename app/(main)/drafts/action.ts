'use server';

import { getSessionUser } from '@/libs/auth/utils';
import prisma from '@/libs/prisma/instance';
import { revalidatePath } from 'next/cache';

export async function deleteDraft(draftId: string) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }

  const draft = await prisma.draft
    .delete({
      where: { id: draftId },
      select: { id: true },
    })
    .catch((e) => {
      console.error(e);
      return null;
    });

  if (draft) {
    revalidatePath('/drafts', 'page');
  }

  return draft;
}
