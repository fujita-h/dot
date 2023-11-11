import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { getUser } from '@/libs/prisma/user';
import { RedirectType, redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();
  const { status, userId } = await getUserIdFromSession(session);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  const user = await getUser(userId).catch((e) => null);
  if (!user) return <Error404 />;

  redirect(`/users/${user.handle}`, RedirectType.replace);
}
