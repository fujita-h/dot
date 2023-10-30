import { DefaultJWT, JWT } from '@auth/core/jwt';

declare module '@auth/core/jwt' {
  interface JWT extends Record<string, unknown>, DefaultJWT {
    oid?: string;
    roles?: string[];
  }
}
