import { SignInForm } from '@/components/auth';
import { FollowingGroups } from '@/components/groups/following';
import { StackList } from '@/components/notes/stack-list';
import { SimplePagination } from '@/components/paginations/simple';
import { FollowingTopics } from '@/components/topics/following';
import { FollowingUsers } from '@/components/users/following';
import { getSessionUser } from '@/libs/auth/utils';
import { SITE_NAME } from '@/libs/constants';
import { getTimelineNotesCount, getTimelineNotesWithUserGroupTopics } from '@/libs/prisma/note';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

const ITEMS_PER_PAGE = 20;

export async function generateMetadata(): Promise<Metadata> {
  const user = await getSessionUser();
  if (!user || !user.id) return { title: `Sign In - ${SITE_NAME}` };

  return { title: `タイムライン - ${SITE_NAME}` };
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  const userId = user.id;

  const _page = Number(searchParams.page);
  const page = _page === undefined || _page === null || Number.isNaN(_page) || _page < 1 ? 1 : Math.floor(_page);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const [notes, count] = await Promise.all([
    getTimelineNotesWithUserGroupTopics(userId, ITEMS_PER_PAGE, skip).catch((e) => []),
    getTimelineNotesCount(userId).catch((e) => 0),
  ]);

  const lastPage = Math.ceil(count / ITEMS_PER_PAGE);
  if (page > lastPage && lastPage > 0) {
    const params = new URLSearchParams();
    params.set('page', lastPage.toString());
    redirect(`?${params.toString()}`);
  }

  return (
    <div>
      <div className="md:flex md:gap-1">
        <div className="flex-none w-80 p-2 space-y-6">
          <div className="mx-2">
            <h3 className="text-sm font-semibold">フォロー中のユーザー</h3>
            <div className="mt-1 mx-1 flex flex-col gap-0.5">
              <Suspense fallback={<div>loading...</div>}>
                <FollowingUsers userId={userId} />
              </Suspense>
            </div>
          </div>
          <div className="mx-2">
            <h3 className="text-sm font-semibold">フォロー中のグループ</h3>
            <div className="mt-1 mx-1 flex flex-col gap-0.5">
              <Suspense fallback={<div>loading...</div>}>
                <FollowingGroups userId={userId} />
              </Suspense>
            </div>
          </div>
          <div className="mx-2">
            <h3 className="text-sm font-semibold">フォロー中のトピック</h3>
            <div className="mt-1 mx-1 flex flex-col gap-0.5">
              <Suspense fallback={<div>loading...</div>}>
                <FollowingTopics userId={userId} />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-md p-2">
              {notes.length === 0 && <div className="m-4">表示するタイムラインがありません</div>}
              {notes.length > 0 && <StackList notes={notes} />}
              {lastPage > 0 && (
                <div className="mt-3 pt-3 pb-3 mx-4 border-t border-gray-200">
                  <SimplePagination page={page} lastPage={lastPage} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
