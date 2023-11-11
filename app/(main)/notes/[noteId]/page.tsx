import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { LikeButton } from '@/components/notes/buttons/like-button';
import { StockButton } from '@/components/notes/buttons/stock-button';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { getNoteWithUserGroupTopics } from '@/libs/prisma/note';
import Link from 'next/link';
import { Body } from './body';
import { OtherMenuButton } from './form';
import { ToC } from './toc';
import { TopicBadge } from '@/components/topic/badge';

export default async function Page({ params }: { params: { noteId: string } }) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  const note = await getNoteWithUserGroupTopics(params.noteId).catch((e) => null);
  if (!note || !note.bodyBlobName) return <Error404 />;

  const releasedAt = note.releasedAt
    ? new Date(note.releasedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
    : '不明な日時';

  return (
    <div>
      {note.Group && (
        <div className="py-4 bg-white border-t border-gray-200">
          <div className="max-w-screen-2xl mx-auto">
            <div className="px-4 lg:px-8">
              <Link href={`/groups/${note.Group.handle}`}>
                <div className="flex items-center">
                  <img src={`/groups/${note.Group.id}/photo`} className="w-10 h-10 rounded-md" alt="group icon" />
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
              <div className="order-0 hidden md:block w-12 print:hidden">
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
                          <div className="mx-2 flex space-x-2 items-center">
                            <div>
                              <img
                                src={`/api/groups/${note.Group.id}/icon`}
                                className="w-5 h-5 rounded-md"
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
                      <div className="mx-1 flex space-x-2 items-center">
                        <div>
                          <img
                            src={`/api/users/${note.User.id}/icon`}
                            className="w-10 h-10 rounded-full"
                            alt="user icon"
                          />
                        </div>
                        <div>
                          <div className="text-sm text-gray-700">@{note.User.handle}</div>
                          <div className="text-base font-bold text-gray-900">{note.User.name}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sticky top-0">
                  <div className="pt-5">
                    <ToC bodyBlobName={note.bodyBlobName} />
                  </div>
                </div>
              </div>
              <div className="order-1 flex-1">
                <div className="bg-white rounded-md ring-1 ring-gray-200 p-4 lg:p-5">
                  <div>
                    <Body bodyBlobName={note.bodyBlobName} />
                  </div>
                </div>
                <div className="rounded-md ring-1 ring-gray-200 my-8 p-4 bg-white">
                  {/* <Comments noteId={note.id} /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
