import prisma from '@/prisma/instance';
import { init as initCuid } from '@paralleldrive/cuid2';
import NextAuth from 'next-auth';
import AzureAD from 'next-auth/providers/azure-ad';
import { NextResponse } from 'next/server';

const cuid = initCuid({ length: 24 });

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 10, // 10 minutes
  },
  callbacks: {
    async authorized({ request, auth }) {
      if (auth) {
        return true;
      }
      return NextResponse.rewrite(new URL('/signin', request.url));
    },
    async signIn({ user, account, profile }) {
      const { oid }: { oid: string } = profile as any;
      const claim = profile as any;

      if (!oid) {
        throw new Error('No oid claim found');
      }

      const dbClaim = await prisma.userClaim
        .findUnique({
          where: { oid: oid },
        })
        .catch((e) => {
          console.error(e);
          throw new Error('Error occurred while fetching user claim');
        });

      if (!dbClaim) {
        const handle = profile?.email?.split('@')[0] || profile?.sub || oid;
        const name =
          user?.name ||
          profile?.name ||
          profile?.preferred_username ||
          profile?.given_name ||
          profile?.family_name ||
          oid;
        await prisma.userClaim
          .create({
            data: {
              id: cuid(),
              oid: oid,
              User: {
                create: {
                  id: cuid(),
                  name: name,
                  handle: handle,
                  about: '',
                },
              },
              data: claim,
            },
          })
          .catch((e) => {
            console.error(e);
            throw new Error('Error occurred while creating user claim');
          });
      } else {
        await prisma.userClaim
          .update({
            where: { oid },
            data: {
              data: claim,
            },
          })
          .catch((e) => {
            console.error(e);
            throw new Error('Error occurred while updating user claim');
          });
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
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
    async jwt({ token, user, account, profile }) {
      // Avoid to include picture in token cookie, remove it from token.
      delete token.picture;
      // add custom fields of profile to token
      if (profile) {
        token.oid = (profile.oid as string) || undefined;
        token.roles = (profile.roles as string[]) || undefined;
      }
      return token;
    },
    async session({ session, token, user }) {
      // include token in session
      return {
        ...session,
        token,
      };
    },
  },
});
