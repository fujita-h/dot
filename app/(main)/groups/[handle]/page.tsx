import { SignInForm } from '@/components/auth';
import { Error404 } from '@/components/error';
import { StackList } from '@/components/notes/stack-list';
import { SimplePagination } from '@/components/paginations/simple';
import { getSessionUser } from '@/libs/auth/utils';
import { SITE_NAME } from '@/libs/constants';
import { getGroupFromHandle, getGroupWithMembersFollowedFromHandle } from '@/libs/prisma/group';
import {
  getNotesCountByGroupId,
  getNotesWithUserGroupTopicsByGroupId,
  getPinnedNotesWithUserGroupTopicsByGroupId,
} from '@/libs/prisma/note';
import { GroupType } from '@prisma/client';
import clsx from 'clsx/lite';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaBlog, FaChessRook, FaLock } from 'react-icons/fa6';
import { FollowToggleButton, JoinToggleButton, OtherMenuButton } from './form';

const ITEMS_PER_PAGE = 10;

type Props = {
  params: { handle: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getSessionUser();
  if (!user || !user.id) return { title: `Sign In - ${SITE_NAME}` };

  const group = await getGroupFromHandle(params.handle).catch((e) => null);
  if (!group) return { title: `Not Found - ${SITE_NAME}` };

  return { title: `${group.name} - ${SITE_NAME}` };
}

export default async function Page({ params, searchParams }: Props) {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  const group = await getGroupWithMembersFollowedFromHandle(params.handle).catch((e) => null);
  if (!group) return <Error404 />;

  const isFollowing = group.FollowedUsers.find((follow) => follow.userId === user.id) ? true : false;
  const isJoined = group.Members.find((member) => member.userId === user.id) ? true : false;

  if (group.type === GroupType.PRIVATE && !group.Members.find((member) => member.userId === user.id)) {
    return (
      <div className="space-y-4">
        <Header group={group} isFollowing={false} isJoined={isJoined} forbbiden={true} />
        <div className="md:flex md:gap-1">
          <div className="mt-4 mx-2 flex-1 items-center">
            <div>あなたにはこのグループを参照する権限がありません</div>
          </div>
        </div>
      </div>
    );
  }

  const _page = Number(searchParams.page);
  const page = _page === undefined || _page === null || Number.isNaN(_page) || _page < 1 ? 1 : Math.floor(_page);
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const pinnedNotes = await getPinnedNotesWithUserGroupTopicsByGroupId(group.id, user.id).catch((e) => []);
  const [notes, count] = await Promise.all([
    getNotesWithUserGroupTopicsByGroupId(group.id, user.id, ITEMS_PER_PAGE, skip).catch((e) => []),
    getNotesCountByGroupId(group.id, user.id).catch((e) => 0),
  ]);
  const lastPage = Math.ceil(count / ITEMS_PER_PAGE);
  if (page > lastPage && lastPage > 0) {
    const params = new URLSearchParams();
    params.set('page', lastPage.toString());
    redirect(`?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <Header group={group} isFollowing={isFollowing} isJoined={isJoined} />
      <div className="md:flex md:gap-1">
        <div className="md:w-80 p-2">
          <div>
            <div className="text-base font-semibold text-gray-800">メンバー</div>
            <div className="mt-2 ml-3 flex gap-1">
              {group.Members.map((member) => (
                <div key={member.userId} className="flex items-center">
                  <Link href={`/users/${member.User.handle}`}>
                    <img
                      src={`/api/users/${member.User.uid}/icon`}
                      className="w-9 h-9 rounded-full object-cover"
                      alt="user-icon"
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:flex-1">
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-md p-2">
              <div className="text-base font-semibold text-gray-800">固定されたノート</div>
              <StackList notes={pinnedNotes} />
            </div>
            <div className="bg-white rounded-md p-2">
              <div className="text-base font-semibold text-gray-800">ノート</div>
              <StackList notes={notes} />
              <div className="mt-3 pt-3 pb-3 mx-4 border-t border-gray-200">
                <SimplePagination page={page} lastPage={lastPage} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({
  group,
  isFollowing,
  isJoined,
  forbbiden = false,
}: {
  group: { id: string; name: string; about: string; type: string };
  isFollowing: boolean;
  isJoined: boolean;
  forbbiden?: boolean;
}) {
  return (
    <div className="bg-white rounded-md">
      <div className={clsx('bg-white relative w-full', 'h-[80px] sm:h-[100px] md:h-[120px] lg:h-[140px] xl:h-[160px]')}>
        <img
          src={`/api/groups/${group.id}/image`}
          className="absolute top-0 w-full h-full object-cover"
          alt="group image"
        />
        <div
          className={clsx(
            'absolute bg-white rounded-md p-1 lg:p-2',
            'top-[60%] sm:top-[50%] left-[5%]',
            'w-[80px] sm:w-[100px] md:w-[120px] lg:w-[140px] xl:w-[160px]',
            'h-[80px] sm:h-[100px] md:h-[120px] lg:h-[140px] xl:h-[160px]'
          )}
        >
          <img src={`/api/groups/${group.id}/icon`} className="w-full h-full rounded-md" alt="group-icon" />
        </div>
      </div>
      <div
        className={clsx(
          'mt-1 lg:mt-2 mr-2',
          'ml-[calc(5%_+_80px_+_8px)] sm:ml-[calc(5%_+_100px_+_8px)] md:ml-[calc(5%_+_120px_+_10px)] lg:ml-[calc(5%_+_140px_+_12px)] xl:ml-[calc(5%_+_160px_+_12px)]',
          'min-h-[60px] md:min-h-[70px] lg:min-h-[80px] xl:min-h-[90px]'
        )}
      >
        <div className="flex justify-between gap-2 items-center">
          <div className="flex-1 text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold">
            {group.name}
            {group.type === GroupType.PRIVATE && (
              <span className="inline-block ml-4 text-2xl font-normal text-yellow-500">
                <FaLock />
              </span>
            )}
            {group.type === GroupType.BLOG && (
              <span className="inline-block ml-4 text-2xl font-normal text-blue-500">
                <FaBlog />
              </span>
            )}
            {group.type === GroupType.COMMUNITY && (
              <span className="inline-block ml-4 text-2xl font-normal text-green-500">
                <FaChessRook />
              </span>
            )}
          </div>
          <div className="hidden mt-2 mr-1 lg:flex lg:flex-none lg:gap-3">
            {group.type === GroupType.COMMUNITY && (
              <div>
                <JoinToggleButton id={group.id} isJoined={isJoined} />
              </div>
            )}
            {!forbbiden && (
              <div>
                <FollowToggleButton id={group.id} isFollowing={isFollowing} />
              </div>
            )}
            {!forbbiden && (
              <div className="inline-flex items-center rounded-md bg-white text-sm font-semibold text-indigo-800 shadow-sm ring-1 ring-inset h-9 ring-gray-300 hover:bg-gray-100 hover:cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                <OtherMenuButton id={group.id} />
              </div>
            )}
          </div>
        </div>
        {group.about && (
          <div className="pb-3 pl-1">
            <p className="text-sm text-gray-500 line-clamp-6 md:line-clamp-4 xl:line-clamp-3">{group.about}</p>
          </div>
        )}
      </div>
    </div>
  );
}
