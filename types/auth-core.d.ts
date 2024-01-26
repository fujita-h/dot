import { User } from '@auth/core';
declare module '@auth/core/types' {
  interface User {
    uid: string;
    handle: string;
    aud?: string;
    tid?: string;
    oid?: string;
    roles?: string[];
  }
}
