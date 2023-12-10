import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { List } from './list';
import { Preview } from './preview';

export default async function Page({ searchParams }: { searchParams: { id?: string; page?: string } }) {
  const session = await auth();
  const { status, userId } = await getUserIdFromSession(session);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  const _page = Number(searchParams.page);
  const page = _page === undefined || _page === null || Number.isNaN(_page) || _page < 1 ? 1 : Math.floor(_page);

  return (
    <div className="flex gap-8 m-2 mb-8">
      <div className="w-96">
        <div className="mb-8">
          <p className="text-3xl font-bold">Drafts</p>
          <p className="text-base text-gray-500 font-noto-sans-jp">下書き一覧</p>
        </div>
        <List userId={userId} id={searchParams.id} page={page} />
      </div>
      <div className="flex-1 m-2 mt-8">
        <Preview userId={userId} id={searchParams.id} page={page} />
      </div>
    </div>
  );
}
