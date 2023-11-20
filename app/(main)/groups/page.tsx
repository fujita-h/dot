import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { CardList } from '@/components/groups/card-list';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { getGroupsWithRecentNotesCountHEAVY } from '@/libs/prisma/group';
import { CreateGroupButton } from './form';

export default async function Page() {
  const session = await auth();
  const { status, userId } = await getUserIdFromSession(session);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  const groups = await getGroupsWithRecentNotesCountHEAVY(7);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold">Groups</div>
          <div>グループ</div>
        </div>
        <div>
          <CreateGroupButton />
        </div>
      </div>
      <div className="mt-6 flex">
        <div className="w-80 min-w-[320px]">left menu</div>
        <div className="flex-1">
          <CardList groups={groups} />
        </div>
      </div>
    </div>
  );
}