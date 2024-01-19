import { SignInForm } from '@/components/auth/sign-in-form';
import { TrendingNotes } from '@/components/notes/trending';
import { FollowingGroups, FollowingTopics, FollowingUsers } from '@/components/topics/following';
import { getSessionUser } from '@/libs/auth/utils';
import { Suspense } from 'react';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  return (
    <div className="print:bg-white">
      <div className="max-w-screen-2xl mx-auto">
        <div className="p-2 md:p-4">
          <main>
            <div className="md:flex md:gap-1">
              <div className="flex-none w-80 p-2 space-y-6">
                <div className="mx-2">
                  <h3 className="text-sm font-semibold">フォロー中のユーザー</h3>
                  <div className="mt-1 mx-1 flex flex-col gap-0.5">
                    <Suspense fallback={<div>loading...</div>}>
                      <FollowingUsers userId={user.id} />
                    </Suspense>
                  </div>
                </div>
                <div className="mx-2">
                  <h3 className="text-sm font-semibold">フォロー中のグループ</h3>
                  <div className="mt-1 mx-1 flex flex-col gap-0.5">
                    <Suspense fallback={<div>loading...</div>}>
                      <FollowingGroups userId={user.id} />
                    </Suspense>
                  </div>
                </div>
                <div className="mx-2">
                  <h3 className="text-sm font-semibold">フォロー中のトピック</h3>
                  <div className="mt-1 mx-1 flex flex-col gap-0.5">
                    <Suspense fallback={<div>loading...</div>}>
                      <FollowingTopics userId={user.id} />
                    </Suspense>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-3">
                  <div className="bg-white rounded-md p-2">
                    <TrendingNotes userId={user.id} />
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
