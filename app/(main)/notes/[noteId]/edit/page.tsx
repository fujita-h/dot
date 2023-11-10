import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { createDraft } from '@/libs/prisma/draft';
import { getNoteWithUserGroupTopics } from '@/libs/prisma/note';
import { getUserWithClaims } from '@/libs/prisma/user';
import { redirect } from 'next/navigation';
import blob from '@/libs/azure/storeage-blob/instance';

export default async function Page({ params }: { params: { noteId: string } }) {
  const session = await auth();
  const { status, userId } = await getUserIdFromSession(session);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;
  const user = await getUserWithClaims(userId);
  if (!user) return <Error404 />;

  const note = await getNoteWithUserGroupTopics(params.noteId).catch((e) => null);
  if (!note || !note.bodyBlobName) return <Error404 />;

  const body = await blob
    .downloadToBuffer('notes', note.bodyBlobName)
    .then((res) => res.toString('utf-8'))
    .catch((e) => '');

  const draft = await createDraft(userId, {
    groupId: note.groupId || undefined,
    relatedNoteId: note.id,
    title: note.title || '',
    body,
    canPostComment: note.canPostComment,
    Topics: note.Topics,
    userName: user.name,
    oid: user.Claim?.oid,
  }).catch((e) => null);
  if (!draft) {
    return <Error500 />;
  }
  redirect(`/drafts/${draft.id}/edit`);
}
