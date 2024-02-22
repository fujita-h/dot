import prisma from '@/libs/prisma/instance';
import { AdapterUser } from '@auth/core/adapters';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { init as initCuid } from '@paralleldrive/cuid2';
import crypto from 'crypto';
import NextAuth, { Session } from 'next-auth';
import AzureAD from 'next-auth/providers/azure-ad';
import { NextResponse } from 'next/server';

const cuid = initCuid({ length: 24 });

// tips: length should be a multiple of 4. Because base64 encode 3 bytes to 4 characters.
const randomString = (length: number) => crypto.randomBytes(length).toString('base64').substring(0, length);

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: 'openid profile email offline_access User.Read',
        },
      },
      profile: (profile, tokens) => {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          aud: profile.aud,
          tid: profile.tid,
          oid: profile.oid,
          roles: profile.roles || [],
          uid: '', // will be generated in callback
          handle: '', // will be generated in callback
        };
      },
      checks: ['pkce', 'state', 'nonce'],
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: Number(process.env.AUTH_SESSION_MAX_AGE) || 60 * 60 * 24, // 24 hours
    updateAge: Number(process.env.AUTH_SESSION_UPDATE_AGE) || 60 * 5, // 5 minutes
    generateSessionToken: () => `${randomString(144)}`,
  },
  events: {
    signIn: async ({ user, account, profile, isNewUser }) => {
      // if new user, generate handle
      if (isNewUser) {
        const newId = cuid();
        await prisma.user.update({
          where: { id: user.id },
          data: { uid: newId, handle: newId },
        });
      }
      // check roles update
      const currentRoles = user.roles || [];
      const incomingRoles: string[] = (profile?.roles as string[]) || [];
      if (!isRolesEqual(currentRoles, incomingRoles)) {
        await prisma.user.update({ where: { id: user.id }, data: { roles: incomingRoles } });
      }
    },
  },
  callbacks: {
    authorized: ({ request, auth }) => {
      if (auth) {
        return true;
      }
      return NextResponse.rewrite(new URL('/signin', request.url));
    },
    redirect: ({ url, baseUrl }) => {
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
    session: async ({ session, user: adapterUser }: { session: Session; user?: AdapterUser }) => {
      const user = getAdapterUser(adapterUser);
      return { ...session, user };
    },
  },
});

function isRolesEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function getAdapterUser(user: any): AdapterUser {
  return {
    id: user.id,
    uid: user.uid,
    aud: user.aud,
    tid: user.tid,
    oid: user.oid,
    handle: user.handle,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    roles: user.roles,
  };
}
