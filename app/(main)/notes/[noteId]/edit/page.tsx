import { SignInForm } from '@/components/auth';
import { Error404, Error500 } from '@/components/error';
import { getSessionUser } from '@/libs/auth/utils';
import blob from '@/libs/azure/storeage-blob/instance';
import { createDraft } from '@/libs/prisma/draft';
import { getNoteWithUserGroupTopics } from '@/libs/prisma/note';
import { redirect } from 'next/navigation';

export default async function Page(props: { params: Promise<{ noteId: string }> }) {
  const params = await props.params;
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  const note = await getNoteWithUserGroupTopics(params.noteId, user.id).catch((e) => null);
  if (!note || !note.bodyBlobName) return <Error404 />;

  const body = await blob
    .downloadToBuffer('notes', note.bodyBlobName)
    .then((res) => res.toString('utf-8'))
    .catch((e) => '');

  const draft = await createDraft(user.id, {
    groupId: note.groupId || undefined,
    relatedNoteId: note.id,
    title: note.title || '',
    body,
    canPostComment: note.canPostComment,
    Topics: note.Topics,
    userName: user.name || '',
    oid: user.oid || '',
    uid: user.id || '',
  }).catch((e) => null);
  if (!draft) {
    return <Error500 />;
  }
  redirect(`/drafts/${draft.id}/edit`);
}
