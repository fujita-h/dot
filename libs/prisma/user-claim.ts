'server-only';

import prisma from '@/prisma/instance';

export function getUserClaimByOid(oid: string) {
  return prisma.userClaim
    .findUnique({
      where: { oid: oid },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user claim');
    });
}
