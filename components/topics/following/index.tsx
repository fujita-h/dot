import { getFollowingTopicsByUserId } from '@/libs/prisma/topic';
import Link from 'next/link';

export async function FollowingTopics({ userId }: { userId: string }) {
  const topics = await getFollowingTopicsByUserId(userId).catch((e) => []);
  if (!topics || topics.length === 0) {
    return <div className="text-xs ml-2">フォロー中のトピックはありません</div>;
  }
  return (
    <>
      {topics.map((topic) => (
        <div key={topic.id}>
          <Link key={topic.id} href={`/topics/${topic.handle}`}>
            <div className="flex items-center gap-2 px-3 py-1 hover:bg-white rounded-sm">
              <div className="flex-shrink-0">
                <img src={`/api/topics/${topic.id}/icon`} className="w-5 h-5 rounded-md bg-white" alt="topic icon" />
              </div>
              <div className="flex-none text-base text-gray-900 truncate">{topic.name}</div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
}
