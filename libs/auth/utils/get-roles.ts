import { Session } from 'next-auth';

/**
 *
 * @param session session object from next-auth
 * @returns Returns array of roles from session object. If there is no roles, it will return empty array.
 */
export function getRolesFromSession(session: Session | null | undefined): string[] {
  if (!session?.token?.roles) {
    return [];
  }
  return session.token.roles;
}
