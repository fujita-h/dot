import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { SITE_NAME } from '@/libs/constants';
import { getGroupFromHandle } from '@/libs/prisma/group';
import { getTopicWithFollowedByHandle } from '@/libs/prisma/topic';
import { Metadata } from 'next';
import { FollowToggleButton, OtherMenuButton } from './form';

type Props = {
  params: { handle: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await auth();
  const { status, userId: sessionUserId } = await getUserIdFromSession(session);
  if (status === 401) return { title: `Sign In - ${SITE_NAME}` };
  if (status === 500) return { title: `Server Error - ${SITE_NAME}` };
  if (status === 404 || !sessionUserId) return { title: `Not Found - ${SITE_NAME}` };

  const group = await getGroupFromHandle(params.handle).catch((e) => null);
  if (!group) return { title: `Not Found - ${SITE_NAME}` };
  return { title: `${group.name} - ${SITE_NAME}` };
}

export default async function Page({ params, searchParams }: Props) {
  const session = await auth();
  const { status, userId: sessionUserId } = await getUserIdFromSession(session, true);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !sessionUserId) return <Error404 />;

  const topic = await getTopicWithFollowedByHandle(params.handle);
  if (!topic) return <Error404 />;

  const isFollowing = topic.FollowedUsers.find((follow) => follow.userId === sessionUserId) ? true : false;

  return (
    <div className="md:flex md:gap-1">
      <div className="md:w-80 p-2">
        <div className="relative p-4 bg-white rounded-md">
          <div className="absolute top-0 right-0 mt-1 mr-1">
            <OtherMenuButton id={topic.id} />
          </div>
          <div className="flex justify-center">
            <div className="text-center">
              <img src={`/api/topics/${topic.id}/icon`} className="w-16 h-16 rounded-md bg-white" alt="topic icon" />
              <div className="text-lg font-semibold text-gray-800 font-noto-sans-jp">{topic.name}</div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <FollowToggleButton id={topic.id} isFollowing={isFollowing} />
          </div>
        </div>
      </div>
      <div className="md:flex-1">
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-md p-2">
            <div className="text-base font-semibold text-gray-800 font-noto-sans-jp">固定されたノート</div>
          </div>
          <div className="bg-white rounded-md p-2">
            <div>Topic notes here</div>
          </div>
        </div>
      </div>
    </div>
  );
}
