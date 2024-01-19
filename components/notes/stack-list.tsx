import Link from 'next/link';

const LOCALE = process.env.LOCALE || 'ja-JP';
const TIMEZONE = process.env.TIMEZONE || 'Asia/Tokyo';

export type Note = {
  id: string;
  title: string | null;
  releasedAt: Date;
  User: {
    id: string;
    handle: string;
    name: string | null;
  };
  Group: {
    id: string;
    handle: string;
    name: string;
  } | null;
};

export function StackList({ notes }: { notes: Note[] }) {
  return (
    <ul role="list" className="divide-y divide-gray-200">
      {notes.map((note) => (
        <li key={note.id} className="relative px-4 py-5">
          <div>
            <div className="flex gap-3">
              <div className="flex-none z-[1]">
                {note.Group ? (
                  <div className="relative">
                    <Link href={`/groups/${note.Group.handle}`} className="group">
                      <img
                        src={`/api/groups/${note.Group.id}/icon`}
                        className="w-10 h-10 rounded-md group-hover:opacity-80"
                        alt="group image"
                      />
                    </Link>
                    <div className="absolute top-6 left-6">
                      <div className="bg-white rounded-full w-5 h-5 p-[1px] flex justify-center items-center">
                        <Link href={`/users/${note.User.handle}`} className="group">
                          <img
                            src={`/api/users/${note.User.id}/icon`}
                            className="w-full h-full rounded-full group-hover:opacity-80"
                            alt="user image"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={`/users/${note.User.handle}`} className="group">
                    <img
                      src={`/api/users/${note.User.id}/icon`}
                      className="w-10 h-10 rounded-full group-hover:opacity-80"
                      alt="user image"
                    />
                  </Link>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <div>
                  <p className="text-sm text-gray-800">
                    {note.releasedAt.toLocaleDateString(LOCALE, { timeZone: TIMEZONE })}
                  </p>
                </div>
                <div className="z-[1]">
                  <p className="text-sm text-gray-800">
                    <Link href={`/users/${note.User.handle}`} className="hover:underline">
                      <span>@{note.User.handle}</span>
                      {note.User.name && <span className="ml-1">({note.User.name})</span>}
                    </Link>
                    {note.Group && (
                      <span>
                        <span> in </span>
                        <Link href={`/groups/${note.Group.handle}`} className="hover:underline">
                          {note.Group.name && <span>{note.Group.name}</span>}
                        </Link>
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex-none">{/* Right side */}</div>
            </div>
            <div className="ml-12 mt-2">
              <Link href={`/notes/${note.id}`} className="group">
                <span className="absolute inset-x-0 -top-px bottom-0" />
                <p className="text-xl font-medium truncate text-gray-700 group-hover:underline">
                  {note.title || 'タイトルなし'}
                </p>
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
