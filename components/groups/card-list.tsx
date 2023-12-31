import Link from 'next/link';

type Group = {
  id: string;
  handle: string;
  name: string;
  about: string;
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
                  <p className="text-lg font-semibold text-gray-900">{group.name}</p>
                </Link>
                {group.about && <p className="mt-3 text-sm text-gray-500">{group.about}</p>}
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
