import { JWT } from '@auth/core/jwt';
import { DefaultSession, Session } from 'next-auth';

export const sessionCallback = async ({
  session,
  token,
}: {
  session: Session;
  token?: JWT;
}): Promise<Session | DefaultSession> => {
  // include token in session
  return {
    ...session,
    token,
  };
};
