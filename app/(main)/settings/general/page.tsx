import { auth } from '@/libs/auth';
import { SignInForm } from '@/components/auth/sign-in-form';
import { getUserIdFromOid } from '@/libs/prisma/user-claim';
import { getUserProfileAndSettings } from '@/libs/prisma/user';
import { Form } from './form';

export default async function Page() {
  const session = await auth();
  const sessionUserId = await getUserIdFromOid(session?.token?.oid);
  if (!sessionUserId) {
    return <SignInForm />;
  }
  const userSettings = await getUserProfileAndSettings(sessionUserId);
  if (!userSettings) {
    // need to create error page
    return <>Error</>;
  }

  if (!userSettings) {
    // need to create error page
    return <>Error</>;
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
