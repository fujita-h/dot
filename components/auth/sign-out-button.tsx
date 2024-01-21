'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton({
  callbackUrl,
  redirect,
  className,
  children,
}: {
  callbackUrl?: string;
  redirect?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button className={className} type="button" onClick={() => signOut({ callbackUrl, redirect })}>
      {children}
    </button>
  );
}
