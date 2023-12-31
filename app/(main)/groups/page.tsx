import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { CardList } from '@/components/groups/card-list';
import { SimplePagination } from '@/components/paginations/simple';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { getGroupsCount, getGroupsWithRecentNotesCountHEAVY } from '@/libs/prisma/group';
import { redirect } from 'next/navigation';
import { CreateGroupButton } from './form';

const ITEMS_PER_PAGE = 10;

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  const { status, userId } = await getUserIdFromSession(session);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

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
    <div>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold">Groups</div>
          <div className="text-gray-600">グループ</div>
        </div>
        <div>
          <CreateGroupButton />
        </div>
      </div>
      <div className="mt-6 flex">
        <div className="w-80 min-w-[320px]"></div>
        <div className="flex-1">
          <p className="text-base">最近投稿のあったグループ</p>
          <CardList groups={groups} />
          <div className="mt-3 pt-3 pb-3 mx-4 border-t border-gray-300">
            <SimplePagination page={page} lastPage={lastPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
