import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { SimpleTab } from '@/components/tabs/simple-tab';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { getGroupWithMembers } from '@/libs/prisma/group';
import { Form } from './form';
import { GroupType } from '@prisma/client';

type Props = {
  params: { groupId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params }: Props) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  const group = await getGroupWithMembers(params.groupId).catch((e) => null);
  if (!group) return <Error404 />;

  if (
    group.type === GroupType.PRIVATE &&
    !group.Members.find((member) => member.userId === userId && member.role === 'ADMIN')
  ) {
    return (
      <div className="space-y-4">
        <div className="md:flex md:gap-1">
          <div className="mt-4 flex-1 items-center">
            <div>あなたにはこのページを参照する権限がありません</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 divide-y divide-gray-900/10">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-4">
        <div className="px-4 sm:px-6">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Group Settings</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">{group.name}</p>
        </div>
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-3">
          <div className="py-6">
            <SimpleTab
              tabs={[
                { name: '一般設定', href: '#', current: true },
                { name: 'メンバー設定', href: './members', current: false },
              ]}
            />
          </div>
          <Form group={group} />
        </div>
      </div>
    </div>
  );
}
