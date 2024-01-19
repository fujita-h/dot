import { SignInForm } from '@/components/auth/sign-in-form';
import { getSessionUser } from '@/libs/auth/utils';
import { RedirectType, redirect } from 'next/navigation';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  redirect(`/users/${user.handle}`, RedirectType.replace);
}
