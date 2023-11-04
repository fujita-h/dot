import { Session } from 'next-auth';
import { getUserId } from '@/libs/prisma/user';

/**
 *
 * Get userId from session object
 *
 * @param session session object from next-auth
 * @param validate validate the userId is contained in database
 * @returns Returns object includes `status` and (`userId` or `error`).
 * @throws This function does not throw error. If error occurred, it will be returned as `error` property of returned object.
 */
export async function getUserIdFromSession(
  session: Session | null | undefined,
  validate: boolean = false
): Promise<{ status: number; userId?: string; error?: string }> {
  if (!session?.token?.userId) {
    return { status: 401, userId: undefined, error: 'No oid in session' };
  }
  if (!validate) {
    return { status: 200, userId: session.token.userId, error: undefined };
  }
  return getUserId(session.token.userId)
    .then((user) => user?.id)
    .then((userId) => {
      if (!userId) {
        return { status: 404, userId: undefined, error: 'The userId in session is not valid' };
      }
      return { status: 200, userId, error: undefined };
    })
    .catch(() => ({ status: 500, userId: undefined, error: 'Error occurred while validation' }));
}
