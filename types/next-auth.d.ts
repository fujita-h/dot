import { DefaultSession } from 'next-auth';
import { JWT } from '@auth/core/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    token?: JWT;
  }
}
