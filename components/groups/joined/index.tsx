import { getJoinedGroups } from '@/libs/prisma/group';
import Link from 'next/link';

export async function JoinedGroups({ userId }: { userId: string }) {
  const groups = await getJoinedGroups(userId).catch((e) => []);
  if (!groups || groups.length === 0) {
    return <div className="text-xs ml-2">参加中のグループはありません</div>;
  }
  return (
    <>
      {groups.map((group) => (
        <div key={group.id}>
          <Link key={group.id} href={`/groups/${group.handle}`}>
            <div className="flex items-center gap-2 px-3 py-1 hover:bg-white rounded-sm">
              <div className="flex-shrink-0">
                <img src={`/api/groups/${group.id}/icon`} className="w-5 h-5 rounded-md bg-white" alt="group icon" />
              </div>
              <div className="flex-none text-base text-gray-900 truncate">{group.name}</div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
}
