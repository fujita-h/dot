import { GroupType } from '@prisma/client';
import Link from 'next/link';
import { FaBlog, FaChessRook, FaLock } from 'react-icons/fa6';

type Group = {
  id: string;
  handle: string;
  name: string;
  about: string;
  type: string;
  _count: {
    Notes: number;
  };
};

export function CardList({ groups }: { groups: Group[] }) {
  return (
    <ul role="list">
      {groups.map((group) => (
        <li key={group.id} className="relative py-2">
          <div className="bg-white rounded-md px-6 py-4">
            <div className="flex gap-6">
              <div className="flex-none flex items-center">
                <img src={`/api/groups/${group.id}/icon`} className="w-8 h-8 rounded-sm" alt="group icon" />
              </div>
              <div className="flex-1">
                <Link href={`/groups/${group.handle}`} className="hover:underline">
                  <span className="absolute inset-x-0 -top-px bottom-0" />
                  <p className="text-lg font-semibold text-gray-900">
                    {group.name}
                    {group.type === GroupType.PRIVATE && (
                      <span className="inline-block ml-2 text-base font-normal text-yellow-500">
                        <FaLock />
                      </span>
                    )}
                    {group.type === GroupType.COMMUNITY && (
                      <span className="inline-block ml-2 text-base font-normal text-green-500">
                        <FaChessRook />
                      </span>
                    )}
                    {group.type === GroupType.BLOG && (
                      <span className="inline-block ml-2 text-base font-normal text-blue-500">
                        <FaBlog />
                      </span>
                    )}
                  </p>
                </Link>
                {group.about && (
                  <p className="mt-3 text-sm text-gray-500 line-clamp-6 md:line-clamp-4 xl:line-clamp-3">
                    {group.about}
                  </p>
                )}
              </div>
              <div className="hidden sm:flex flex-none  flex-col justify-center text-center">
                <div>{group._count.Notes}</div>
                <div className="text-xs">Note</div>
              </div>
            </div>
            <div className="sm:hidden flex items-center gap-1 mt-2">
              <div>{group._count.Notes}</div>
              <div className="text-xs">Note</div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
