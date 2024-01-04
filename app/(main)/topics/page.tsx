import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { TopicBadge } from '@/components/topics/badge';
import { auth } from '@/libs/auth';
import { getUserIdFromSession, getRolesFromSession } from '@/libs/auth/utils';
import { getTopics } from '@/libs/prisma/topic';
import { AddTopicButton } from './form';

const USER_ROLE_FOR_TOPIC_CREATION = process.env.USER_ROLE_FOR_TOPIC_CREATION || '';

export default async function Page() {
  const session = await auth();
  const { status, userId } = await getUserIdFromSession(session);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  // Get user roles from session, and check if the user is allowed to create a topic
  const roles = await getRolesFromSession(session);
  const isAllowedToCreateTopic = !USER_ROLE_FOR_TOPIC_CREATION || roles.includes(USER_ROLE_FOR_TOPIC_CREATION);

  const topics = await getTopics();

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold">Topics</div>
          <div className="text-gray-600">トピック</div>
        </div>
        <div>{isAllowedToCreateTopic && <AddTopicButton />}</div>
      </div>
      <div className="mt-6 flex">
        {/* <div className="w-80 min-w-[320px]">left menu</div> */}
        <div className="flex-1 flex gap-4 flex-wrap">
          {topics.map((topic) => (
            <TopicBadge key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </div>
  );
}
