import { AutoSignInForm } from '@/components/auth';
import { SignInForm } from '@/components/auth';
import { getSessionUser } from '@/libs/auth/utils';

export default async function Page(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const user = await getSessionUser();
  const callbackUrl = searchParams.callbackUrl as string | undefined;

  if (!user || !user.id) return <SignInForm callbackUrl={callbackUrl} />;
  return <AutoSignInForm callbackUrl={callbackUrl} />;
}
