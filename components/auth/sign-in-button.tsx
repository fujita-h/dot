'use client';

import { BuiltInProviderType } from 'next-auth/providers';
import { LiteralUnion, signIn } from 'next-auth/react';

/**
 *
 * Button to sign in with a specific provider.
 *
 * @remarks
 * This is a client-side component.
 * This component is a wrapper around the `signIn` function from `next-auth/react`.
 *
 * @param provider - The provider to use. Defaults to Azure AD.
 * @param callbackUrl - The URL to return to after signing in. Defaults to the current page.
 * @param classNames - The CSS classes to apply to the button.
 * @param children - The text or components to display inside the button.
 */
export function SignInButton({
  provider = 'azure-ad',
  callbackUrl,
  className,
  children,
}: {
  provider?: LiteralUnion<BuiltInProviderType>;
  callbackUrl?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      className={className}
      type="button"
      onClick={() => {
        signIn(provider, { callbackUrl });
      }}
    >
      {children}
    </button>
  );
}
