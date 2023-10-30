'server-only';

import prisma from '@/prisma/instance';

export async function getUserIdFromOid(oid?: string) {
  if (!oid) {
    return undefined;
  }
  const dbClaim = await prisma.userClaim
    .findUnique({
      select: { userId: true },
      where: { oid: oid },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching user claim');
    });
  return dbClaim?.userId;
}
