'use client';

import { TextLogo } from '@/components/text-logo';
import { BuiltInProviderType } from 'next-auth/providers';
import { LiteralUnion, signIn } from 'next-auth/react';
import { useEffect } from 'react';

export function AutoSignInForm({
  provider = 'azure-ad',
  callbackUrl,
}: {
  provider?: LiteralUnion<BuiltInProviderType>;
  callbackUrl?: string;
}) {
  useEffect(() => {
    signIn(provider, { callbackUrl });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="fixed inset-0 bg-gray-300 flex justify-center items-center">
        <div className="bg-white rounded-md shadow-sm p-4 w-96">
          <div className="text-center">
            <div>
              <TextLogo />
            </div>
            <div>Sign in to your account</div>
            <div className="mt-6">
              <div className="bg-indigo-700 text-white p-2 rounded-md w-full">
                <div className="flex gap-3 items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <div>Please wait..</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
