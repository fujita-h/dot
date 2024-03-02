'server-only';

import { getUserAccountsTokenExpiresAt } from '@/libs/prisma/user';

export async function checkAccountAuthorization(userId: string) {
  const userAccount = await getUserAccountsTokenExpiresAt(userId)
    .then((data) => data?.accounts.find((account) => account.provider === 'azure-ad'))
    .catch(() => undefined);

  if (!userAccount) {
    throw new Error('User account not found');
  }

  if (!userAccount.expires_at) {
    throw new Error('User account expiration not found');
  }

  const now = new Date().getTime();
  const expiresAt = new Date(userAccount.expires_at * 1000).getTime();
  return now < expiresAt;
}
