import { auth } from '@/libs/auth';
import { redirect } from 'next/navigation';
import { SignInForm } from '@/components/auth/sign-in-form';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { Error404, Error500 } from '@/components/error';

export default async function Page() {
  const session = await auth();
  const { status, userId: sessionUserId, error } = await getUserIdFromSession(session, true);
  if (status === 401) {
    return <SignInForm />;
  }
  if (status === 500) {
    return <Error500 />;
  }
  if (status === 404 || !sessionUserId) {
    return <Error404 />;
  }

  redirect(`/users/${sessionUserId}`);
}
