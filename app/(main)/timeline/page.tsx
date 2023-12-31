import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { StackList } from '@/components/notes/stack-list';
import { FollowingGroups, FollowingTopics, FollowingUsers } from '@/components/topics/following';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { SITE_NAME } from '@/libs/constants';
import { getTimelineNotesWithUserGroupTopics } from '@/libs/prisma/note';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: `タイムライン - ${SITE_NAME}`,
};

export default async function Page() {
  const session = await auth();
  const { status, userId } = await getUserIdFromSession(session);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  const notes = await getTimelineNotesWithUserGroupTopics(userId);

  return (
    <div>
      <div className="md:flex md:gap-1">
        <div className="flex-none w-80 p-2 space-y-6">
          <div className="mx-2">
            <h3 className="text-sm font-semibold">フォロー中のユーザー</h3>
            <div className="mt-1 mx-1 flex flex-col gap-0.5">
              <Suspense fallback={<div>loading...</div>}>
                <FollowingUsers userId={userId} />
              </Suspense>
            </div>
          </div>
          <div className="mx-2">
            <h3 className="text-sm font-semibold">フォロー中のグループ</h3>
            <div className="mt-1 mx-1 flex flex-col gap-0.5">
              <Suspense fallback={<div>loading...</div>}>
                <FollowingGroups userId={userId} />
              </Suspense>
            </div>
          </div>
          <div className="mx-2">
            <h3 className="text-sm font-semibold">フォロー中のトピック</h3>
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
              <StackList notes={notes} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
