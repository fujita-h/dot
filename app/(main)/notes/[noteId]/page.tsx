import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { LikeButton } from '@/components/notes/buttons/like-button';
import { StockButton } from '@/components/notes/buttons/stock-button';
import { StackList } from '@/components/notes/stack-list';
import { TopicBadge } from '@/components/topics/badge';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import blob from '@/libs/azure/storeage-blob/instance';
import es from '@/libs/elasticsearch/instance';
import { getCommentsByNoteId } from '@/libs/prisma/comment';
import { getReadableGroups } from '@/libs/prisma/group';
import { getNoteWithUserGroupTopics } from '@/libs/prisma/note';
import { incrementAccess } from '@/libs/redis/access';
import Link from 'next/link';
import { CommentEditor, CommentViewer, NoteViewer, OtherMenuButton, ScrollToC } from './form';

import './style.css';

const LOCALE = process.env.LOCALE || 'ja-JP';
const TIMEZONE = process.env.TIMEZONE || 'Asia/Tokyo';

export default async function Page({ params }: { params: { noteId: string } }) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  const note = await getNoteWithUserGroupTopics(params.noteId, userId).catch((e) => null);
  if (!note || !note.bodyBlobName) return <Error404 />;

  const blobBody = await blob
    .downloadToBuffer('notes', note.bodyBlobName)
    .then((res) => res.toString('utf-8'))
    .catch((e) => null);

  if (!blobBody) return <Error500 />;

  await incrementAccess(note.id, note.groupId).catch((e) => null);

  const releasedAt = new Date(note.releasedAt).toLocaleDateString(LOCALE, {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div>
      {note.Group && (
        <div className="py-4 bg-white border-t border-gray-200">
          <div className="max-w-screen-2xl mx-auto">
            <div className="px-4 lg:px-8">
              <Link href={`/groups/${note.Group.handle}`}>
                <div className="flex items-center">
                  <img src={`/api/groups/${note.Group.id}/icon`} className="w-10 h-10 rounded-md" alt="group icon" />
                  <div className="ml-3 text-xl font-bold text-gray-900 hover:text-gray-500 hover:underline">
                    {note.Group.name}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="bg-slate-100 print:bg-white border-t border-gray-200">
        <div className="max-w-screen-2xl mx-auto">
          <div className="p-4 md:p-8">
            <div className="flex space-x-1 mb-6">
              <div className="order-0 hidden md:block w-12 print:hidden"></div>
              <div className="order-1 flex-1">
                <div className="space-y-1 sm:space-y-2 mx-4">
                  <div
                    id="note_title"
                    className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight"
                  >
                    {note.title || 'タイトルなし'}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {note.Topics.map((t) => (
                      <TopicBadge key={t.topicId} topic={t.Topic} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="order-0 hidden md:block w-12 print:hidden z-[1]">
                <div></div>
                <div className="sticky top-0">
                  <div className="pt-5 flex flex-col gap-4">
                    <LikeButton userId={userId} noteId={note.id} />
                    <StockButton userId={userId} noteId={note.id} />
                    <div className="w-10 h-10 flex items-center justify-center">
                      <OtherMenuButton note={note} className="w-8 h-8 text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-2 hidden lg:block w-80 print:hidden">
                <div>
                  <div className="rounded-md bg-white ring-1 ring-gray-200 p-4 flex flex-col divide-y divide-gray-300 ">
                    <div className="pb-2">
                      <div className="mx-2">
                        <div className="text-gray-800">{releasedAt} に公開</div>
                      </div>
                    </div>
                    {note.Group ? (
                      <div className="py-2">
                        <div className="inline-block py-1 px-2 rounded-md bg-white ring-1 ring-gray-200">
                          <div className="mx-1 flex space-x-2 items-center">
                            <div className="flex-none">
                              <img
                                src={`/api/groups/${note.Group.id}/icon`}
                                className="w-8 h-8 rounded-md"
                                alt="group icon"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-800">{note.Group.name}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                    <div className="pt-2">
                      <Link href={`/users/${note.User.handle}`} className="group">
                        <div className="mx-1 flex space-x-2 items-center">
                          <div>
                            <img
                              src={`/api/users/${note.User.id}/icon`}
                              className="w-10 h-10 rounded-full group-hover:opacity-80"
                              alt="user icon"
                            />
                          </div>
                          <div>
                            <div className="text-sm text-gray-700">@{note.User.handle}</div>
                            <div className="text-base font-bold text-gray-900 group-hover:underline">
                              {note.User.name}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="sticky top-0">
                  <div className="pt-5">
                    <ScrollToC body={blobBody} />
                  </div>
                </div>
              </div>
              <div className="order-1 flex-1 overflow-hidden">
                <div className="bg-white rounded-md ring-1 ring-gray-200 p-4 lg:p-5 overflow-x-auto">
                  <div id="note-viewer">
                    <NoteViewer jsonString={blobBody} />
                  </div>
                </div>
                <div className="rounded-md ring-1 ring-gray-200 my-8 bg-white">
                  <div className="text-lg font-bold text-gray-900 border-b px-4 pt-2 pb-1">コメント</div>
                  <div className="p-4">
                    <CommentList noteId={note.id} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 border-t mt-6 px-4 pt-2 pb-1">コメントを書く</div>
                    <div id="comment-editor" className="px-4 pt-2 pb-4">
                      <CommentEditor noteId={note.id} />
                    </div>
                  </div>
                </div>
                <div className="rounded-md ring-1 ring-gray-200 my-8 bg-white">
                  <div className="text-lg font-bold text-gray-900 border-b px-4 pt-2 pb-1">関連記事</div>
                  <div className="p-4">
                    <RelatedNoteList userId={userId} noteId={note.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function CommentList({ noteId }: { noteId: string }) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (status !== 200) return <></>;

  const comments = await getCommentsByNoteId(noteId).catch((e) => []);

  return (
    <div className="divide-y divide-gray-200">
      {comments.map((c) => (
        <div key={c.id} className="px-2 py-4">
          <div className="flex justify-between items-center">
            <div className="mx-1 flex space-x-3 items-center">
              <div>
                <img src={`/api/users/${c.User.id}/icon`} className="w-6 h-6 rounded-full" alt="user icon" />
              </div>
              <div>
                <div className="text-sm text-gray-700">
                  @{c.User.handle} ({c.User.name})
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">
                {new Date(c.createdAt).toLocaleString(LOCALE, { timeZone: TIMEZONE })}
              </div>
            </div>
          </div>
          <div className="mt-4 px-4">
            <div className="text-sm text-gray-700">
              {c.bodyBlobName ? <CommnetBody containerName="comments" bodyBlobName={c.bodyBlobName} /> : <></>}
            </div>
          </div>
        </div>
      ))}
      {comments.length === 0 && (
        <div className="px-4 py-4">
          <div className="text-base text-gray-700">この記事にまだコメントはありません。</div>
        </div>
      )}
    </div>
  );
}

async function CommnetBody({ containerName, bodyBlobName }: { containerName: string; bodyBlobName: string }) {
  const body = await blob
    .downloadToBuffer(containerName, bodyBlobName)
    .then((res) => res.toString('utf-8'))
    .catch((e) => null);
  if (!body) return <></>;
  return (
    <div id="comment-viewer">
      <CommentViewer jsonString={body} />
    </div>
  );
}

async function RelatedNoteList({ userId, noteId }: { userId: string; noteId: string }) {
  // Get groups that user can read
  const groups = await getReadableGroups(userId)
    .then((groups) => groups.map((g) => g.id))
    .then((groupIds) => [...groupIds, 'NULL'])
    .catch((e) => []);

  // Get embed vector of the note
  const embed = await es
    .get('notes', noteId, 'body_embed_ada_002')
    .then((doc) => {
      if (!doc.found) return null;
      const source: any = doc._source;
      if (!source || !source.body_embed_ada_002) return null;
      return source.body_embed_ada_002;
    })
    .catch((e) => null);
  if (!embed) return <></>;

  // Get related notes
  const relatedNotes = await es
    .search('notes', {
      _source: ['title', 'releasedAt', 'userId', 'groupId', 'User.handle', 'User.name', 'Group.handle', 'Group.name'],
      knn: {
        field: 'body_embed_ada_002',
        query_vector: embed,
        k: 10,
        num_candidates: 10,
        filter: {
          bool: {
            must_not: [{ term: { id: noteId } }],
            should: [{ terms: { groupId: groups } }],
            minimum_should_match: 1,
          },
        },
      },
    })
    .then((res) => {
      return res.hits.hits.map((hit: any) => {
        const source = hit._source;
        const User = { id: source.userId, handle: source.User.handle, name: source.User.name };
        const Group = source.groupId
          ? { id: source.groupId, handle: source.Group.handle, name: source.Group.name }
          : null;
        return {
          id: hit._id,
          title: source.title,
          releasedAt: new Date(source.releasedAt),
          User,
          Group,
        };
      });
    })
    .catch((e) => []);

  return <StackList notes={relatedNotes} />;
}
