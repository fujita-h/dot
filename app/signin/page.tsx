import { AutoSignInForm } from '@/components/auth/auto-sign-in-form';
import { SignInForm } from '@/components/auth/sign-in-form';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';

export default async function Page() {
  const session = await auth();
  const { userId } = await getUserIdFromSession(session);
  if (!userId) {
    return <SignInForm />;
  }
  return <AutoSignInForm callbackUrl="/" />;
}
