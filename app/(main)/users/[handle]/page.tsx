import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { StackList } from '@/components/notes/stack-list';
import { SimpleTab } from '@/components/tabs/simple-tab';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { SITE_NAME } from '@/libs/constants';
import {
  getCommentedNotesCount,
  getCommentedNotesWithUserGroupTopics,
  getNotesCount,
  getNotesWithUserGroupTopics,
} from '@/libs/prisma/note';
import { getUserFromHandle, getUserWithFollowedFromHandle } from '@/libs/prisma/user';
import clsx from 'clsx/lite';
import { Metadata } from 'next';
import { FollowToggleButton } from './form';
import { redirect } from 'next/navigation';
import { SimplePagination } from '@/components/paginations/simple';
import qs from 'qs';

const ITEMS_PER_PAGE = 20;

type Props = {
  params: { handle: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await auth();
  const { status, userId: sessionUserId } = await getUserIdFromSession(session);
  if (status === 401) return { title: `Sign In - ${SITE_NAME}` };
  if (status === 500) return { title: `Server Error - ${SITE_NAME}` };
  if (status === 404 || !sessionUserId) return { title: `Not Found - ${SITE_NAME}` };

  const user = await getUserFromHandle(params.handle).catch((e) => null);
  if (!user) return { title: `Not Found - ${SITE_NAME}` };
  return { title: `${user.name} - ${SITE_NAME}` };
}

export default async function Page({ params, searchParams }: Props) {
  const session = await auth();
  const { status, userId: sessionUserId } = await getUserIdFromSession(session, true);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !sessionUserId) return <Error404 />;

  const urlSearchParams = new URLSearchParams(qs.stringify(searchParams));

  const user = await getUserWithFollowedFromHandle(params.handle).catch((e) => null);
  if (!user) return <Error404 />;

  const isFollowing = user.FollowedUsers.find((follow) => follow.fromUserId === sessionUserId) ? true : false;

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
  const [notes, count] = await notesFunc(user.id, ITEMS_PER_PAGE, skip);
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
            src={`/api/users/${user.id}/image`}
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
            <img src={`/api/users/${user.id}/icon`} className="w-full h-full rounded-full" alt="user-icon" />
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
              <div className="text-base md:text-xl lg:text-2xl xl:text-3xl font-bold truncate">{user.name}</div>
              <div className="text-xs md:text-sm lg:text-base text-gray-500 truncate">@{user.handle}</div>
            </div>
            <div className="hidden mt-2 mr-1 lg:flex lg:flex-none lg:gap-3">
              <div>
                <FollowToggleButton id={user.id} isFollowing={isFollowing} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="md:flex md:gap-1">
        <div className="md:w-80 p-2">
          <div>
            <div className="text-base font-semibold text-gray-800">所属グループ</div>
          </div>
          <div>
            <div className="text-base font-semibold text-gray-800">フォロー中のグループ</div>
          </div>
          <div>
            <div className="text-base font-semibold text-gray-800">フォロー中のトピック</div>
          </div>
        </div>
        <div className="md:flex-1">
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-md p-2">
              <div className="text-base font-semibold text-gray-800">固定されたノート</div>
            </div>
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
                <StackList notes={notes} />
                <div className="mt-3 pt-3 pb-3 mx-4 border-t border-gray-200">
                  <SimplePagination page={page} lastPage={lastPage} searchParams={urlSearchParams} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
