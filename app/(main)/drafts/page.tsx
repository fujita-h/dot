import { SignInForm } from '@/components/auth';
import { getSessionUser } from '@/libs/auth/utils';
import { List } from './list';
import { Preview } from './preview';

import './style.css';

export default async function Page(props: { searchParams: Promise<{ id?: string; page?: string }> }) {
  const searchParams = await props.searchParams;
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  const _page = Number(searchParams.page);
  const page = _page === undefined || _page === null || Number.isNaN(_page) || _page < 1 ? 1 : Math.floor(_page);

  return (
    <div className="flex gap-8 m-2 mb-8">
      <div className="w-96">
        <div className="mb-8">
          <p className="text-3xl font-bold">Drafts</p>
          <p className="text-base text-gray-500">下書き一覧</p>
        </div>
        <List userId={user.id} id={searchParams.id} page={page} />
      </div>
      <div className="flex-1 m-2 mt-8">
        <Preview userId={user.id} id={searchParams.id} page={page} />
      </div>
    </div>
  );
}
