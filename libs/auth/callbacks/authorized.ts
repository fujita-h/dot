import { Session } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const authorizedCallback = async ({
  request,
  auth,
}: {
  request: NextRequest;
  auth: Session | null;
}): Promise<boolean | NextResponse | Response | undefined> => {
  if (auth) {
    return true;
  }
  return NextResponse.rewrite(new URL('/signin', request.url));
};
