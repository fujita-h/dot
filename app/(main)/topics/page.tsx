import { SignInForm } from '@/components/auth/sign-in-form';
import { TopicBadge } from '@/components/topics/badge';
import { getSessionUser } from '@/libs/auth/utils';
import { getTopics } from '@/libs/prisma/topic';
import { AddTopicButton } from './form';

const USER_ROLE_FOR_TOPIC_CREATION = process.env.USER_ROLE_FOR_TOPIC_CREATION || '';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  const roles = user.roles || [];
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
