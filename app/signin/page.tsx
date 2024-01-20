import { AutoSignInForm } from '@/components/auth';
import { SignInForm } from '@/components/auth';
import { getSessionUser } from '@/libs/auth/utils';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;
  return <AutoSignInForm callbackUrl="/" />;
}
