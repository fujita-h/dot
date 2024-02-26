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

export async function UpdateGroupAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { status: 'error', target: null, message: 'Session error', lastModified: Date.now() };
  }

  // check group id
  const groupId = formData.get('id') as string;
  if (!groupId) {
    return { status: 'error', target: null, message: 'Group id is required', lastModified: Date.now() };
  }
  // check group permission
  const group = await prisma.group.findUnique({
    where: { id: groupId, Members: { some: { userId: user.id, role: 'ADMIN' } } },
  });
  if (!group) {
    return {
      status: 'error',
      target: null,
      message: 'グループが存在しないか、権限がありません。',
      lastModified: Date.now(),
    };
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
    await prisma.group.update({
      where: { id: groupId },
      data: {
        handle: formData.get('handle') as string,
        name: formData.get('name') as string,
        about: formData.get('about') as string,
      },
    });
    const image = formData.get('image') as File;
    if (image.size > 0 && image.type.startsWith('image/')) {
      await blob.upload('groups', `${groupId}/image`, image.type, Buffer.from(await image.arrayBuffer()));
    }
    const icon = formData.get('icon') as File;
    if (icon.size > 0 && icon.type.startsWith('image/')) {
      await blob.upload('groups', `${groupId}/icon`, icon.type, Buffer.from(await icon.arrayBuffer()));
    }
    revalidatePath(`/groups/0/${group.id}/settings/general`);
    return { status: 'success', target: null, message: 'Update success', lastModified: Date.now() };
  } catch (e) {
    console.error(e);
    return { status: 'error', target: null, message: 'Update error', lastModified: Date.now() };
  }
}

export async function DeleteGroup(id: string, handle: string) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    throw new Error('Session error');
  }

  // check group permission
  const group = await prisma.group.findUnique({
    where: { id },
    select: { id: true, handle: true, Members: { where: { userId: user.id, role: 'ADMIN' } } },
  });
  if (!group || !group.Members.length) {
    throw new Error('グループが存在しないか、権限がありません。');
  }

  // check handle
  if (group.handle !== handle) {
    throw new Error('グループの handle が一致しません。');
  }

  // check group notes exists
  const notesCount = await prisma.note.count({ where: { groupId: id } });
  if (notesCount > 0) {
    throw new Error('グループにノートが存在します。');
  }

  const result = await prisma.group.delete({ where: { id } }).catch((e) => {
    throw new Error('Delete error');
  });
  revalidatePath(`/groups/0/${group.id}/settings/general`);
  revalidatePath(`/groups/${group.handle}`);
  return result;
}
