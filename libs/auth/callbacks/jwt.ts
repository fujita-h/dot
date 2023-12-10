import { getUserClaimByOid } from '@/libs/prisma/user-claim';
import { AdapterUser } from '@auth/core/adapters';
import { JWT } from '@auth/core/jwt';
import { Account, Profile, User } from 'next-auth';

export const jwtCallback = async ({
  token,
  user,
  account,
  profile,
  isNewUser,
}: {
  token: JWT;
  user: User | AdapterUser;
  account: Account | null;
  profile?: Profile;
  trigger?: 'signIn' | 'signUp' | 'update';
  isNewUser?: boolean;
  session?: any;
}): Promise<JWT | null> => {
  // Avoid to include picture in token cookie, remove it from token.
  delete token.picture;
  // Profile is undefined unless the user explicitly sign-in.
  if (profile) {
    // add custom fields of profile to token
    token.oid = (profile.oid as string) || undefined;
    token.roles = (profile.roles as string[]) || undefined;
    token.userId = token.oid ? await getUserClaimByOid(token.oid).then((claim) => claim?.userId) : undefined;
  }
  return token;
};
