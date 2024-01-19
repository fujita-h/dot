import { AutoSignInForm } from '@/components/auth/auto-sign-in-form';
import { SignInForm } from '@/components/auth/sign-in-form';
import { getSessionUser } from '@/libs/auth/utils';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;
  return <AutoSignInForm callbackUrl="/" />;
}
