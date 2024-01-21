import { SignInForm } from '@/components/auth';
import { Error404 } from '@/components/error';
import { getSessionUser } from '@/libs/auth/utils';
import blob from '@/libs/azure/storeage-blob/instance';
import { getDraftWithGroupTopics } from '@/libs/prisma/draft';
import { getTopics } from '@/libs/prisma/topic';
import { getUserSetting } from '@/libs/prisma/user-setting';
import { Form } from './form';

export default async function Page({ params }: { params: { draftId: string } }) {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;
  if (!params.draftId) return <Error404 />;

  const [setting, draft, topicOptions] = await Promise.all([
    getUserSetting(user.id).catch((e) => ({ editorShowNewLineFloatingMenu: true })),
    getDraftWithGroupTopics(user.id, params.draftId).catch((e) => null),
    getTopics().catch((e) => []),
  ]);

  if (!draft) return <Error404 />;

  let body = '';
  if (draft?.id && draft?.bodyBlobName) {
    body = await blob
      .downloadToBuffer('drafts', draft.bodyBlobName)
      .then((res) => res.toString('utf-8'))
      .catch((e) => '');
  }

  return (
    <Form
      setting={setting}
      draftId={draft.id}
      groupId={draft.groupId || undefined}
      relatedNoteId={draft.relatedNoteId || undefined}
      title={draft.title || ''}
      body={body}
      topics={draft?.Topics.map((t) => t.Topic) || []}
      topicOptions={topicOptions}
    />
  );
}
