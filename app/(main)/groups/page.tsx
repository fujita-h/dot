import { SignInForm } from '@/components/auth';
import { CardList } from '@/components/groups/card-list';
import { SimplePagination } from '@/components/paginations/simple';
import { getSessionUser } from '@/libs/auth/utils';
import { getGroupsCount, getGroupsWithRecentNotesCountHEAVY } from '@/libs/prisma/group';
import { redirect } from 'next/navigation';
import { CreateGroupButton } from './form';

const ITEMS_PER_PAGE = 10;
const USER_ROLE_FOR_GROUP_CREATION = process.env.USER_ROLE_FOR_GROUP_CREATION || '';

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  const roles = user.roles || [];
  const isAllowedToCreateGroup = !USER_ROLE_FOR_GROUP_CREATION || roles.includes(USER_ROLE_FOR_GROUP_CREATION);

  const _page = Number(searchParams.page);
  const page = _page === undefined || _page === null || Number.isNaN(_page) || _page < 1 ? 1 : Math.floor(_page);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const [groups, count] = await Promise.all([
    getGroupsWithRecentNotesCountHEAVY(28, ITEMS_PER_PAGE, skip).catch((e) => []),
    getGroupsCount().catch((e) => 0),
  ]);

  const lastPage = Math.ceil(count / ITEMS_PER_PAGE);
  if (page > lastPage && lastPage > 0) {
    const params = new URLSearchParams();
    params.set('page', lastPage.toString());
    redirect(`?${params.toString()}`);
  }

  return (
    <div className="p-2 md:p-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold">Groups</div>
          <div className="text-gray-600">グループ</div>
        </div>
        <div>{isAllowedToCreateGroup && <CreateGroupButton />}</div>
      </div>
      <div className="flex mt-6 md:mt-8">
        {/* <div className="w-80 min-w-[320px]"></div> */}
        <div className="flex-1">
          <p className="text-base">最近投稿のあったグループ</p>
          <CardList groups={groups} />
          <div className="mt-3 pt-3 pb-3 px-4 border-t border-gray-300">
            <SimplePagination page={page} lastPage={lastPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
