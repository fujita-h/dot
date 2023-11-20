import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';

export default async function Page() {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  return (
    <div className="print:bg-white">
      <div className="max-w-screen-2xl mx-auto">
        <div className="p-2 md:p-4">
          <main>
            <div>Home</div>
          </main>
        </div>
      </div>
    </div>
  );
}
