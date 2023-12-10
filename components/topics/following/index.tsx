import { getFollowingGroupsByUserId } from '@/libs/prisma/group';
import { getFollowingTopicsByUserId } from '@/libs/prisma/topic';
import { getFollowingUsersByUserId } from '@/libs/prisma/user';
import Link from 'next/link';

export async function FollowingUsers({ userId }: { userId: string }) {
  const users = await getFollowingUsersByUserId(userId).catch((e) => []);
  if (!users || users.length === 0) {
    return <div className="text-xs ml-2">フォロー中のユーザーはいません</div>;
  }
  return (
    <>
      {users.map((user) => (
        <div key={user.id}>
          <Link key={user.id} href={`/users/${user.handle}`}>
            <div className="flex items-center gap-3 px-3 py-1 hover:bg-white rounded-sm">
              <div className="flex-shrink-0">
                <img src={`/api/users/${user.id}/icon`} className="w-4 h-4 rounded-full" alt="user icon" />
              </div>
              <div className="flex-none text-sm text-gray-900 truncate">{user.name}</div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
}

export async function FollowingGroups({ userId }: { userId: string }) {
  const groups = await getFollowingGroupsByUserId(userId).catch((e) => []);
  if (!groups || groups.length === 0) {
    return <div className="text-xs ml-2">フォロー中のグループはありません</div>;
  }
  return (
    <>
      {groups.map((group) => (
        <div key={group.id}>
          <Link key={group.id} href={`/groups/${group.handle}`}>
            <div className="flex items-center gap-3 px-3 py-1 hover:bg-white rounded-sm">
              <div className="flex-shrink-0">
                <img src={`/api/groups/${group.id}/icon`} className="w-4 h-4 rounded-full" alt="group icon" />
              </div>
              <div className="flex-none text-sm text-gray-900 truncate">{group.name}</div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
}

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
            <div className="flex items-center gap-3 px-3 py-1 hover:bg-white rounded-sm">
              <div className="flex-shrink-0">
                <img src={`/api/topics/${topic.id}/icon`} className="w-4 h-4 rounded-full" alt="topic icon" />
              </div>
              <div className="flex-none text-sm text-gray-900 truncate">{topic.name}</div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
}
