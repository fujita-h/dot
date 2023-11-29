import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { TrendingNotes } from '@/components/notes/trending';
import { FollowingTopics } from '@/components/topics/following';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { Suspense } from 'react';

export default async function Page() {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  return (
    <div className="print:bg-white">
      <div className="max-w-screen-2xl mx-auto">
        <div className="p-2 md:p-4">
          <main>
            <div className="md:flex md:gap-1">
              <div className="flex-none w-80 p-2">
                <div className="mx-2">
                  <h3 className="text-sm font-noto-sans-jp font-semibold">フォロー中のトピック</h3>
                  <div className="mt-1 mx-1 flex flex-col gap-0.5">
                    <Suspense fallback={<div>loading...</div>}>
                      <FollowingTopics userId={userId} />
                    </Suspense>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-3">
                  <div className="bg-white rounded-md p-2">
                    <TrendingNotes userId={userId} />
                  </div>
                </div>
              </div>
              {/**
               * TODO: If you want to add a right menu, please uncomment the following code.
               * <div className="flex-none w-80 p-2">Right menu here.</div>
               */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
