'use server';

import { getSessionUser } from '@/libs/auth/utils';
import blob from '@/libs/azure/storeage-blob/instance';
import es from '@/libs/elasticsearch/instance';
import { createDraft } from '@/libs/prisma/draft';
import { checkPostableGroup } from '@/libs/prisma/group';
import prisma from '@/libs/prisma/instance';
import { getNoteWithUserGroupTopics } from '@/libs/prisma/note';
import { generateTipTapText } from '@/libs/tiptap/text';
import { init as initCuid } from '@paralleldrive/cuid2';
import { MembershipRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const cuid = initCuid();

export async function deleteNote(noteId: string) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }

  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
    },
  });

  if (note?.userId !== user.id) {
    return { error: 'Unauthorized' };
  }

  const result = await prisma.$transaction(async (tx) => {
    await es.delete('notes', noteId, [404]);
    const note = await tx.note.delete({
      where: {
        id: noteId,
      },
    });
    return note;
  });
  if (result) {
    revalidatePath(`/notes/${noteId}`);
  }
  return result;
}

export async function commentOnNote(noteId: string, commentId: string | null, body: string) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }
  const userId = user.id;

  // check if commentId is valid
  let isEdited = false;
  if (commentId) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return { error: 'Comment not found' };
    }
    if (comment.noteId !== noteId) {
      return { error: 'Comment not found' };
    }
    if (comment.userId !== userId) {
      return { error: 'Unauthorized' };
    }
    isEdited = true;
  }
  const id = commentId || cuid();

  const metadata = {
    commentId: id,
    userId: userId,
    noteId: noteId,
  };
  const tags = {
    commentId: id,
    userId: userId,
    noteId: noteId,
  };

  // create TipTap text for check valid json
  const bodyText = generateTipTapText(body);

  const blobName = `${noteId}/${id}/${cuid()}`;
  const blobUploadResult = await blob
    .upload('comments', blobName, 'text/markdown', body, metadata, tags)
    .then((res) => res._response.status)
    .catch((err) => 500);

  if (blobUploadResult !== 201) {
    return { error: 'Failed to upload comment' };
  }

  const result = await prisma.comment.upsert({
    where: { id: id },
    create: {
      id: id,
      noteId: noteId,
      userId: userId,
      bodyBlobName: blobName,
      isEdited: isEdited,
    },
    update: {
      bodyBlobName: blobName,
      isEdited: isEdited,
    },
  });
  if (result) {
    revalidatePath(`/notes/${noteId}`);
  }
  return result;
}

export async function pinNoteToUserProfile(noteId: string, pinned: boolean) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }
  const userId = user.id;

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) {
    return { error: 'Note not found' };
  }
  if (note.userId !== userId) {
    return { error: 'Unauthorized' };
  }

  const result = await prisma.note.update({
    where: {
      id: noteId,
    },
    data: {
      isUserPinned: pinned,
    },
  });
  if (result) {
    revalidatePath(`/notes/${noteId}`);
  }
  return result;
}

export async function pinNoteToGroupProfile(noteId: string, pinned: boolean) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }
  const userId = user.id;

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) {
    return { error: 'Note not found' };
  }
  const groupId = note.groupId;
  if (!groupId) {
    return { error: 'Note not in group' };
  }
  const group = await prisma.group.findUnique({ where: { id: groupId }, include: { Members: true } });
  if (!group) {
    return { error: 'Group not found' };
  }
  const member = group.Members.find((member) => member.userId === userId && member.role === MembershipRole.ADMIN);
  if (!member) {
    return { error: 'Unauthorized' };
  }

  const result = await prisma.note.update({
    where: {
      id: noteId,
    },
    data: {
      isGroupPinned: pinned,
    },
  });
  if (result) {
    revalidatePath(`/notes/${noteId}`);
  }
  return result;
}

export async function duplicateNoteToDraft(noteId: string, groupId?: string) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }
  const userId = user.id;

  const note = await getNoteWithUserGroupTopics(noteId, user.id).catch((e) => null);
  if (!note) {
    return { error: 'Note not found' };
  }

  if (groupId) {
    const isGroupPostable = await checkPostableGroup(userId, groupId).catch((e) => false);
    if (!isGroupPostable) {
      return { error: 'Unauthorized' };
    }
  }

  const body = await blob
    .downloadToBuffer('notes', note.bodyBlobName)
    .then((res) => res.toString('utf-8'))
    .catch((e) => '');

  const draft = await createDraft(userId, {
    groupId: groupId || undefined,
    title: note.title || '',
    body: body || '',
    Topics: note.Topics,
    userName: user.name || '',
    oid: user.oid || '',
    uid: user.id || '',
  }).catch((e) => null);

  return draft;
}

export async function deleteComment(commentId: string) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return { error: 'Unauthorized' };
  }

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (comment?.userId !== user.id) {
    return { error: 'Unauthorized' };
  }

  const result = await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
  if (result) {
    revalidatePath(`/notes/${comment.noteId}`);
  }
  return result;
}
