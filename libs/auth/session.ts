import { Session } from 'next-auth';
import { getUserClaimByOid } from '@/libs/prisma/user-claim';

/**
 *
 * Get userId from session object
 *
 * @param session session object from next-auth
 * @returns Returns object includes `status` and (`userId` or `error`).
 * @throws This function does not throw error. If error occurred, it will be returned as `error` property of returned object.
 */
export function getUserIdFromSession(
  session: Session | null | undefined
): Promise<{ status: number; userId?: string; error?: string }> {
  if (!session?.token?.oid) {
    return Promise.resolve({ status: 401, userId: undefined, error: 'No oid in session' });
  }
  return getUserClaimByOid(session.token.oid)
    .then((claim) => ({
      status: 200,
      userId: claim?.userId,
      error: undefined,
    }))
    .catch((e: any) => {
      console.error(e);
      return { status: 500, userId: undefined, error: 'Error occurred while fetching user claim' };
    });
}
