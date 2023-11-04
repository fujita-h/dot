import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { auth } from '@/libs/auth';
import { getUserProfileAndSettings } from '@/libs/prisma/user';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { Form } from './form';

export default async function Page() {
  const session = await auth();
  const { status, userId: sessionUserId, error } = await getUserIdFromSession(session);
  if (status === 401) {
    return <SignInForm />;
  }
  if (status === 500) {
    return <Error500 />;
  }
  if (status === 404 || !sessionUserId) {
    return <Error404 />;
  }

  const userSettings = await getUserProfileAndSettings(sessionUserId).catch(() => null);
  if (!userSettings) {
    return <Error404 />;
  }

  return (
    <div className="space-y-10 divide-y divide-gray-900/10">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-gray-900">General</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600"> あなたのアカウントの情報を設定します。 </p>
        </div>
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <Form props={userSettings} />
        </div>
      </div>
    </div>
  );
}
