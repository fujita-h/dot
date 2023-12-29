import { TopicBadge } from '@/components/topics/badge';
import blob from '@/libs/azure/storeage-blob/instance';
import { getDraftWithGroupTopics } from '@/libs/prisma/draft';
import { DraftViewer, OtherMenuButton } from './form';

export async function Preview({ userId, id, page }: { userId: string; id?: string; page: number }) {
  if (!id) return <></>;

  const draft = await getDraftWithGroupTopics(userId, id).catch((e) => null);
  if (!draft || !draft.bodyBlobName) {
    return <div>データがありません</div>;
  }

  const blobBody = await blob
    .downloadToBuffer('drafts', draft.bodyBlobName)
    .then((res) => res.toString('utf-8'))
    .catch((e) => '');

  if (!blobBody) {
    return <div>データがありません</div>;
  }

  return (
    <div>
      <div className="my-2">
        <div className="flex-1">
          {draft.Group && <div className="text-sm text-gray-500">{draft.Group.name}</div>}
          <div className="text-2xl font-bold">{draft.title || 'タイトルなし'}</div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 flex gap-2 flex-wrap">
            {draft.Topics.map((t) => (
              <TopicBadge key={t.topicId} topic={t.Topic} />
            ))}
          </div>
          <div>
            <div className="flex gap-3">
              <a href={`/drafts/${draft.id}/edit`}>
                <div className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 hover:cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  編集する
                </div>
              </a>
              <div className="inline-flex items-center rounded-md bg-white text-sm font-semibold text-indigo-800 shadow-sm ring-1 ring-gray-300 hover:bg-gray-100 hover:cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                <OtherMenuButton id={draft.id} page={page} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="draft-viewer" className="mt-4 border border-inset border-gray-300 shadow bg-white p-2 rounded-md">
        <DraftViewer jsonString={blobBody} />
      </div>
    </div>
  );
}
