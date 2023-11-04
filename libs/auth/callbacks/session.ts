import { AdapterUser } from '@auth/core/adapters';
import { JWT } from '@auth/core/jwt';
import { DefaultSession, Session } from 'next-auth';

export const sessionCallback = async ({
  session,
  token,
  user,
  newSession,
  trigger,
}: {
  session: Session;
  token: JWT;
  user: AdapterUser;
  newSession: any;
  trigger: 'update';
}): Promise<Session | DefaultSession> => {
  // include token in session
  return {
    ...session,
    token,
  };
};
