'use server';

import { getSessionUser } from '@/libs/auth/utils';
import blob from '@/libs/azure/storeage-blob/instance';
import es from '@/libs/elasticsearch/instance';
import { createDraft } from '@/libs/prisma/draft';
import { checkPostableGroup } from '@/libs/prisma/group';
import prisma from '@/libs/prisma/instance';
import { getNote, getNoteWithUserGroupTopics } from '@/libs/prisma/note';
import { getUserSetting } from '@/libs/prisma/user-setting';
import { generateTipTapText } from '@/libs/tiptap/text';
import { init as initCuid } from '@paralleldrive/cuid2';
import { CommentNotificationType, MembershipRole } from '@prisma/client';
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

  // check user is allowed to access note
  const note = await getNote(noteId, userId);
  if (!note) {
    return { error: 'Note not found or not allowed' };
  }

  // check if commentId is valid
  let mode: 'NEW' | 'EDIT' = 'NEW';
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
    mode = 'EDIT';
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

  // create TipTap text for check valid json. If invalid, it will throw an error.
  generateTipTapText(body);

  const blobName = `${noteId}/${id}/${cuid()}`;
  const blobUploadResult = await blob
    .upload('comments', blobName, 'text/markdown', body, metadata, tags)
    .then((res) => res._response.status)
    .catch((err) => 500);

  if (blobUploadResult !== 201) {
    return { error: 'Failed to upload comment' };
  }

  if (mode == 'NEW') {
    const result = await prisma.comment.create({
      data: {
        id: id,
        noteId: noteId,
        userId: userId,
        bodyBlobName: blobName,
        isEdited: false,
      },
    });

    if (result) {
      revalidatePath(`/notes/${noteId}`);

      //
      // Notification Processes
      //   Run asynchronously to avoid blocking the main process
      //

      // 1. Notification for note owner
      (async () => {
        const noteOwnerSetting = await getUserSetting(note.userId);
        if (noteOwnerSetting.notificationOnCommentAdded) {
          // if user setting is set to receive notification on comment added, create notification
          await prisma.notification.create({
            data: {
              id: cuid(),
              userId: note.userId,
              NotificationComment: {
                create: {
                  id: cuid(),
                  type: CommentNotificationType.COMMNET_ADDED,
                  commentId: id,
                },
              },
            },
          });
        }
      })();

      // 2. Notification for other commenters
      (async () => {
        // get distinct commenter user ids except the current user
        const commenterIds = await prisma.comment
          .findMany({
            select: {
              userId: true,
            },
            where: {
              noteId: noteId,
              userId: {
                not: userId,
              },
            },
            distinct: ['userId'],
          })
          .then((res) => res.map((r) => r.userId));

        for (const commenterId of commenterIds) {
          const commenterSetting = await getUserSetting(commenterId);
          if (commenterSetting.notificationOnCommentReplied) {
            // if user setting is set to receive notification on comment replied, create notification
            await prisma.notification.create({
              data: {
                id: cuid(),
                userId: commenterId,
                NotificationComment: {
                  create: {
                    id: cuid(),
                    type: CommentNotificationType.COMMNET_ADDED,
                    commentId: id,
                  },
                },
              },
            });
          }
        }
      })();
    }
    return result;
  } else {
    // mode == 'EDIT'
    const result = await prisma.comment.update({
      where: {
        id: id,
      },
      data: {
        bodyBlobName: blobName,
        isEdited: true,
      },
    });
    if (result) {
      revalidatePath(`/notes/${noteId}`);
    }
    return result;
  }
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

  const result = await prisma
    .$transaction([
      // delete notification
      prisma.notification.deleteMany({
        where: {
          NotificationComment: {
            commentId: commentId,
          },
        },
      }),
      prisma.comment.delete({
        where: {
          id: commentId,
        },
        select: {
          id: true,
          noteId: true,
        },
      }),
    ])
    .then(([, result]) => {
      return { id: result.id, noteId: result.noteId, error: undefined };
    })
    .catch((e) => {
      console.error(e);
      return { id: undefined, noteId: undefined, error: 'Error occurred while deleting comment' };
    });

  if (result.error) {
    return { error: result.error };
  }
  if (result) {
    revalidatePath(`/notes/${result.noteId}`);
  }
  return result;
}
