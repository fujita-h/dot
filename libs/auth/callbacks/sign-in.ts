import prisma from '@/prisma/instance';
import { AdapterUser } from '@auth/core/adapters';
import { init as initCuid } from '@paralleldrive/cuid2';
import { Account, Profile, User } from 'next-auth';
import { CredentialInput } from 'next-auth/providers';

const cuid = initCuid({ length: 24 });

export const signInCallback = async ({
  user,
  account,
  profile,
  email,
  credentials,
}: {
  user: User | AdapterUser;
  account: Account | null;
  profile?: Profile | undefined;
  email?: { verificationRequest?: boolean | undefined } | undefined;
  credentials?: Record<string, CredentialInput> | undefined;
}): Promise<boolean> => {
  const { oid }: { oid: string } = profile as any;
  const claim = profile as any;

  if (!oid) {
    throw new Error('No oid claim found');
  }

  const dbClaim = await prisma.userClaim
    .findUnique({
      where: { oid: oid },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user claim');
    });

  if (!dbClaim) {
    const handle = profile?.email?.split('@')[0] || profile?.sub || oid;
    const name =
      user?.name || profile?.name || profile?.preferred_username || profile?.given_name || profile?.family_name || oid;
    await prisma.userClaim
      .create({
        data: {
          id: cuid(),
          oid: oid,
          User: {
            create: {
              id: cuid(),
              name: name,
              handle: handle,
              about: '',
            },
          },
          data: claim,
        },
      })
      .catch((e) => {
        console.error(e);
        throw new Error('Error occurred while creating user claim');
      });
  } else {
    await prisma.userClaim
      .update({
        where: { oid },
        data: {
          data: claim,
        },
      })
      .catch((e) => {
        console.error(e);
        throw new Error('Error occurred while updating user claim');
      });
  }
  return true;
};
