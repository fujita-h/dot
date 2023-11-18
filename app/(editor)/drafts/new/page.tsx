import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { createDraft } from '@/libs/prisma/draft';
import { RedirectType, redirect } from 'next/navigation';

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  const { status, userId } = await getUserIdFromSession(session, true);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  const { group } = searchParams;
  const groupId = Array.isArray(group) ? group[0] : group;

  const draft = await createDraft(userId, { groupId }).catch((e) => null);
  if (!draft) {
    return <Error500 />;
  }
  redirect(`/drafts/${draft.id}/edit`, RedirectType.replace);
}
