import NextAuth from 'next-auth';
import AzureAD from 'next-auth/providers/azure-ad';
import { authorizedCallback, signInCallback, redirectCallback, jwtCallback, sessionCallback } from './callbacks';

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
    maxAge: Number(process.env.SESSION_MAX_AGE) || 60 * 60 * 24, // 24 hours
  },
  callbacks: {
    authorized: authorizedCallback,
    signIn: signInCallback,
    redirect: redirectCallback,
    jwt: jwtCallback,
    session: sessionCallback,
  },
});
