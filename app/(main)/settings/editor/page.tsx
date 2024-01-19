import { SignInForm } from '@/components/auth/sign-in-form';
import { Error500 } from '@/components/error';
import { SimpleTab } from '@/components/tabs/simple-tab';
import { getSessionUser } from '@/libs/auth/utils';
import { getUserSetting } from '@/libs/prisma/user-setting';
import { Form } from './form';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  const userSettings = await getUserSetting(user.id).catch(() => null);
  if (!userSettings) {
    return <Error500 />;
  }

  return (
    <div className="space-y-10 divide-y divide-gray-900/10">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-4">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Editor</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">エディターの設定をします。</p>
        </div>
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-3">
          <div className="py-6">
            <SimpleTab
              tabs={[
                { name: '一般設定', href: './general', current: false },
                { name: 'エディター設定', href: '#', current: true },
              ]}
            />
          </div>
          <Form props={userSettings} />
        </div>
      </div>
    </div>
  );
}
