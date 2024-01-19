import { SignInForm } from '@/components/auth/sign-in-form';
import { Error500 } from '@/components/error';
import { getSessionUser } from '@/libs/auth/utils';
import { createDraft } from '@/libs/prisma/draft';
import { RedirectType, redirect } from 'next/navigation';

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  const { group } = searchParams;
  const groupId = Array.isArray(group) ? group[0] : group;

  const draft = await createDraft(user.id, { groupId }).catch((e) => null);
  if (!draft) {
    return <Error500 />;
  }
  redirect(`/drafts/${draft.id}/edit`, RedirectType.replace);
}
