import prisma from '@/libs/prisma/instance';
import { AdapterUser } from '@auth/core/adapters';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { init as initCuid } from '@paralleldrive/cuid2';
import NextAuth, { Session } from 'next-auth';
import AzureAD from 'next-auth/providers/azure-ad';
import { NextResponse } from 'next/server';

const cuid = initCuid({ length: 24 });
const cuid12 = initCuid({ length: 12 });

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
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: Number(process.env.SESSION_MAX_AGE) || 60 * 60 * 24, // 24 hours
    updateAge: Number(process.env.SESSION_UPDATE_AGE) || 60, // 60 seconds
    generateSessionToken: () => `${cuid()}.${cuid12()}.${cuid()}`,
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
    session: async ({ session, user }: { session: Session; user?: AdapterUser }) => {
      return { ...session, user };
    },
  },
});

function isRolesEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
