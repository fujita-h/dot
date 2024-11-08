import { AutoSignInForm, SignInForm } from '@/components/auth';
import { Error404 } from '@/components/error';
import { SimpleTab } from '@/components/tabs/simple-tab';
import { checkAccountAuthorization, getSessionUser } from '@/libs/auth/utils';
import { getGroupWithMembers } from '@/libs/prisma/group';
import { getUsersWithEmail } from '@/libs/prisma/user';
import { GroupType } from '@prisma/client';
import { Form } from './form';

type Props = {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const params = await props.params;
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;
  const userId = user.id;

  const isAuthorized = await checkAccountAuthorization(userId).catch(() => false);
  if (!isAuthorized) {
    // warn: endless loop if auth status is not updated
    return <AutoSignInForm />;
  }

  const group = await getGroupWithMembers(params.groupId).catch((e) => null);
  const users = await getUsersWithEmail().catch((e) => []);
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

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-3">
          <div className="py-6">
            <SimpleTab
              tabs={[
                { name: '一般設定', href: './general', current: false },
                { name: 'メンバー設定', href: '#', current: true },
              ]}
            />
          </div>
          <Form group={group} users={users} />
        </div>
      </div>
    </div>
  );
}
