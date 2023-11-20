import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { getTimelineNotesWithUserGroupTopics } from '@/libs/prisma/note';
import { StackList } from '@/components/notes/stack-list';
import { Metadata } from 'next';
import { SITE_NAME } from '@/libs/constants';

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
        <div className="flex-none w-80 p-2">left menu</div>
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
