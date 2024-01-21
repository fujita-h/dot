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
            <div className="flex items-center gap-2 px-3 py-1 hover:bg-white rounded-sm">
              <div className="flex-shrink-0">
                <img src={`/api/users/${user.uid}/icon`} className="w-5 h-5 rounded-full bg-white" alt="user icon" />
              </div>
              <div className="flex-none text-base text-gray-900 truncate">{user.name}</div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
}
