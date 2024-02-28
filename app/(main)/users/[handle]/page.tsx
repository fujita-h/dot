import { SignInForm } from '@/components/auth';
import { Error404 } from '@/components/error';
import { FollowingGroups } from '@/components/groups/following';
import { JoinedGroups } from '@/components/groups/joined';
import { StackList } from '@/components/notes/stack-list';
import { SimplePagination } from '@/components/paginations/simple';
import { SimpleTab } from '@/components/tabs/simple-tab';
import { FollowingTopics } from '@/components/topics/following';
import { FollowingUsers } from '@/components/users/following';
import { getSessionUser } from '@/libs/auth/utils';
import { SITE_NAME } from '@/libs/constants';
import {
  getCommentedNotesCount,
  getCommentedNotesWithUserGroupTopics,
  getNotesCount,
  getNotesWithUserGroupTopics,
  getPinnedNotesWithUserGroupTopics,
} from '@/libs/prisma/note';
import { getUserFromHandle, getUserWithFollowedFromHandle } from '@/libs/prisma/user';
import clsx from 'clsx/lite';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import qs from 'qs';
import { Suspense } from 'react';
import { FollowToggleButton } from './form';

const ITEMS_PER_PAGE = 20;

type Props = {
  params: { handle: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getSessionUser();
  if (!user || !user.id) return { title: `Sign In - ${SITE_NAME}` };

  const targetUser = await getUserFromHandle(params.handle).catch((e) => null);
  if (!targetUser) return { title: `Not Found - ${SITE_NAME}` };

  return { title: `${targetUser.name} - ${SITE_NAME}` };
}

export default async function Page({ params, searchParams }: Props) {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  const urlSearchParams = new URLSearchParams(qs.stringify(searchParams));

  const targetUser = await getUserWithFollowedFromHandle(params.handle).catch((e) => null);
  if (!targetUser) return <Error404 />;

  const isFollowing = targetUser.FollowedUsers.find((follow) => follow.fromUserId === user.id) ? true : false;

  const tab = searchParams.tab;
  const currentTab = tab === 'comments' ? 'comments' : 'posts';

  const _page = Number(searchParams.page);
  const page = _page === undefined || _page === null || Number.isNaN(_page) || _page < 1 ? 1 : Math.floor(_page);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const getCommentedNotesFunc = (userId: string, take?: number, skip?: number) =>
    Promise.all([
      getCommentedNotesWithUserGroupTopics(userId, take, skip).catch((e) => []),
      getCommentedNotesCount(userId).catch((e) => 0),
    ]);
  const getNotesFunc = (userId: string, take?: number, skip?: number) =>
    Promise.all([
      getNotesWithUserGroupTopics(userId, take, skip).catch((e) => []),
      getNotesCount(userId).catch((e) => 0),
    ]);
  const notesFunc = tab === 'comments' ? getCommentedNotesFunc : getNotesFunc;
  const pinnedNotes = await getPinnedNotesWithUserGroupTopics(targetUser.id).catch((e) => []);
  const [notes, count] = await notesFunc(targetUser.id, ITEMS_PER_PAGE, skip);
  const lastPage = Math.ceil(count / ITEMS_PER_PAGE);
  if (page > lastPage && lastPage > 0) {
    const params = new URLSearchParams(urlSearchParams);
    params.set('page', lastPage.toString());
    redirect(`?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md">
        <div
          className={clsx('bg-white relative w-full', 'h-[80px] sm:h-[100px] md:h-[120px] lg:h-[140px] xl:h-[160px]')}
        >
          <img
            src={`/api/users/${targetUser.uid}/image`}
            className="absolute top-0 w-full h-full object-cover"
            alt="user image"
          />
          <div
            className={clsx(
              'absolute bg-white rounded-full p-1 lg:p-2',
              'top-[60%] sm:top-[50%] left-[5%]',
              'w-[80px] sm:w-[100px] md:w-[120px] lg:w-[140px] xl:w-[160px]',
              'h-[80px] sm:h-[100px] md:h-[120px] lg:h-[140px] xl:h-[160px]'
            )}
          >
            <img src={`/api/users/${targetUser.uid}/icon`} className="w-full h-full rounded-full" alt="user-icon" />
          </div>
        </div>
        <div
          className={clsx(
            'mt-1 lg:mt-2 mr-2',
            'ml-[calc(5%_+_80px_+_5px)] sm:ml-[calc(5%_+_100px_+_5px)] md:ml-[calc(5%_+_120px_+_5px)] lg:ml-[calc(5%_+_140px_+_5px)] xl:ml-[calc(5%_+_160px_+_5px)]',
            'min-h-[60px] md:min-h-[70px] lg:min-h-[80px] xl:min-h-[90px]'
          )}
        >
          <div className="flex justify-between gap-2">
            <div>
              <div className="text-base md:text-xl lg:text-2xl xl:text-3xl font-bold truncate">{targetUser.name}</div>
              <div className="text-xs md:text-sm lg:text-base text-gray-500 truncate">@{targetUser.handle}</div>
            </div>
            <div className="hidden mt-2 mr-1 lg:flex lg:flex-none lg:gap-3">
              <div>
                <FollowToggleButton id={targetUser.id} isFollowing={isFollowing} />
              </div>
            </div>
          </div>
          {targetUser.about && (
            <div className="text-xs lg:text-sm text-gray-700 py-4 md:pr-2">
              <pre className="font-noto-sans-jp whitespace-pre-wrap line-clamp-[9] md:line-clamp-[7] lg:line-clamp-5">
                {targetUser.about}
              </pre>
            </div>
          )}
        </div>
      </div>
      <div className="md:flex md:gap-1">
        <div className="md:w-80 p-2 space-y-6">
          <div className="mx-2">
            <h3 className="text-sm font-semibold">参加しているグループ</h3>
            <div className="mt-1 mx-1 flex flex-col gap-0.5">
              <Suspense fallback={<div>loading...</div>}>
                <JoinedGroups userId={targetUser.id} />
              </Suspense>
            </div>
          </div>
          <div className="mx-2">
            <h3 className="text-sm font-semibold">フォローしているユーザー</h3>
            <div className="mt-1 mx-1 flex flex-col gap-0.5">
              <Suspense fallback={<div>loading...</div>}>
                <FollowingUsers userId={targetUser.id} />
              </Suspense>
            </div>
          </div>
          <div className="mx-2">
            <h3 className="text-sm font-semibold">フォローしているグループ</h3>
            <div className="mt-1 mx-1 flex flex-col gap-0.5">
              <Suspense fallback={<div>loading...</div>}>
                <FollowingGroups userId={targetUser.id} />
              </Suspense>
            </div>
          </div>
          <div className="mx-2">
            <h3 className="text-sm font-semibold">フォローしているトピック</h3>
            <div className="mt-1 mx-1 flex flex-col gap-0.5">
              <Suspense fallback={<div>loading...</div>}>
                <FollowingTopics userId={targetUser.id} />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="md:flex-1 min-w-0">
          <div className="flex flex-col gap-3">
            {pinnedNotes.length > 0 && (
              <div className="bg-white rounded-md p-2">
                <div className="text-base font-semibold text-gray-800">固定されたノート</div>
                <StackList notes={pinnedNotes} />
              </div>
            )}
            <div className="bg-white rounded-md p-2">
              <div className="my-3">
                <SimpleTab
                  tabs={[
                    { name: '投稿したノート', href: '?tab=posts', current: currentTab === 'posts' },
                    { name: 'コメントしたノート', href: '?tab=comments', current: currentTab === 'comments' },
                  ]}
                />
              </div>
              <div>
                {notes.length === 0 && <div className="m-4">ノートがありません</div>}
                {notes.length > 0 && <StackList notes={notes} />}
                {lastPage > 0 && (
                  <div className="mt-3 pt-3 pb-3 mx-4 border-t border-gray-200">
                    <SimplePagination page={page} lastPage={lastPage} searchParams={urlSearchParams} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
