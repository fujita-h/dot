import { AutoSignInForm, SignInForm } from '@/components/auth';
import { Error404 } from '@/components/error';
import { SimpleTab } from '@/components/tabs/simple-tab';
import { checkAccountAuthorization, getSessionUser } from '@/libs/auth/utils';
import { getGroupWithMembers } from '@/libs/prisma/group';
import { GroupType } from '@prisma/client';
import { DeleteForm, Form } from './form';

type Props = {
  params: { groupId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params }: Props) {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;
  const userId = user.id;

  const isAuthorized = await checkAccountAuthorization(userId).catch(() => false);
  if (!isAuthorized) {
    // warn: endless loop if auth status is not updated
    return <AutoSignInForm />;
  }

  const group = await getGroupWithMembers(params.groupId).catch((e) => null);
  if (!group) return <Error404 />;

  if (
    group.type === GroupType.PRIVATE &&
    !group.Members.find((member) => member.userId === user.id && member.role === 'ADMIN')
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
        <div className="md:col-span-3 space-y-8 mb-8">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
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
          <div className="bg-white shadow-sm ring-1 ring-red-600 sm:rounded-xl">
            <DeleteForm group={group} />
          </div>
        </div>
      </div>
    </div>
  );
}
