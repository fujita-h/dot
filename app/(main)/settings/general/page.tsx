import { AutoSignInForm, SignInForm } from '@/components/auth';
import { Error404 } from '@/components/error';
import { SimpleTab } from '@/components/tabs/simple-tab';
import { checkAccountAuthorization, getSessionUser } from '@/libs/auth/utils';
import { getUserProfileAndSettings } from '@/libs/prisma/user';
import { Form } from './form';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;
  const userId = user.id;

  const isAuthorized = await checkAccountAuthorization(userId).catch(() => false);
  if (!isAuthorized) {
    // warn: endless loop if auth status is not updated
    return <AutoSignInForm />;
  }

  const userSettings = await getUserProfileAndSettings(userId).catch(() => null);
  if (!userSettings) {
    return <Error404 />;
  }

  return (
    <div className="space-y-10 divide-y divide-gray-900/10">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-4">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">General</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600"> あなたのアカウントの情報を設定します。 </p>
        </div>
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-3">
          <div className="py-6">
            <SimpleTab
              tabs={[
                { name: '一般設定', href: '#', current: true },
                { name: 'エディター設定', href: './editor', current: false },
                { name: '通知設定', href: './notification', current: false },
              ]}
            />
          </div>
          <Form props={userSettings} />
        </div>
      </div>
    </div>
  );
}
