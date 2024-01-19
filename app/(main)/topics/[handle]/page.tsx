import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404 } from '@/components/error';
import { StackList } from '@/components/notes/stack-list';
import { getSessionUser } from '@/libs/auth/utils';
import { SITE_NAME } from '@/libs/constants';
import { getNotesWithUserGroupTopicsByTopicId } from '@/libs/prisma/note';
import { getTopicByHandle, getTopicWithFollowedByHandle } from '@/libs/prisma/topic';
import { Metadata } from 'next';
import { FollowToggleButton, OtherMenuButton } from './form';

type Props = {
  params: { handle: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getSessionUser();
  if (!user || !user.id) return { title: `Sign In - ${SITE_NAME}` };

  const group = await getTopicByHandle(params.handle).catch((e) => null);
  if (!group) return { title: `Not Found - ${SITE_NAME}` };

  return { title: `${group.name} - ${SITE_NAME}` };
}

export default async function Page({ params, searchParams }: Props) {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  const topic = await getTopicWithFollowedByHandle(params.handle);
  if (!topic) return <Error404 />;

  const isFollowing = topic.FollowedUsers.find((follow) => follow.userId === user.id) ? true : false;
  const notes = await getNotesWithUserGroupTopicsByTopicId(topic.id, user.id).catch((e) => []);

  return (
    <div className="md:flex md:gap-2 md:m-2">
      <div className="md:w-80 px-2">
        <div className="relative p-4 bg-white rounded-md">
          <div className="absolute top-0 right-0 mt-1 mr-1">
            <OtherMenuButton id={topic.id} />
          </div>
          <div className="flex justify-center">
            <div className="text-center">
              <img src={`/api/topics/${topic.id}/icon`} className="w-16 h-16 rounded-md bg-white" alt="topic icon" />
              <div className="text-lg font-semibold text-gray-800">{topic.name}</div>
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
            <div>
              <StackList notes={notes} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
