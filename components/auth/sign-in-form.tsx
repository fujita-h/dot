import { TextLogo } from '@/components/text-logo';
import { SignInButton } from './sign-in-button';

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <div className="fixed inset-0 bg-gray-300 flex justify-center items-center">
      <div className="bg-white rounded-md shadow-sm p-4 w-96">
        <div className="text-center">
          <div>
            <TextLogo />
          </div>
          <div>Sign in to your account</div>
          <div className="mt-6">
            <SignInButton
              className="bg-indigo-700 text-white p-2 rounded-md w-full hover:bg-indigo-600"
              callbackUrl={callbackUrl}
            >
              Sign In
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  );
}
