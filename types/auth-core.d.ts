import { User } from '@auth/core';
declare module 'next-auth' {
  interface User {
    uid: string;
    handle: string;
    aud?: string;
    tid?: string;
    oid?: string;
    roles?: string[];
  }
}
