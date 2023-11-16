import Link from 'next/link';

type Note = {
  id: string;
  title: string | null;
  releasedAt: Date;
  User: {
    id: string;
    handle: string;
    name: string;
  };
};

export function StackList({ notes }: { notes: Note[] }) {
  return (
    <ul role="list" className="divide-y divide-gray-200">
      {notes.map((note) => (
        <li
          key={note.id}
          className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 sm:flex-nowrap"
        >
          <div>
            <div className="flex gap-2">
              <div className="z-[2]">
                <Link href={`/users/${note.User.handle}`} className="group">
                  <img
                    src={`/api/users/${note.User.id}/icon`}
                    className="w-10 h-10 rounded-full group-hover:opacity-80"
                    alt="user image"
                  />
                </Link>
              </div>
              <div className="flex flex-col">
                <div className="z-[2]">
                  <Link href={`/users/${note.User.handle}`} className="hover:underline">
                    <p className="text-sm text-gray-800">
                      <span>@{note.User.handle}</span>
                      {note.User.name && <span className="ml-1">({note.User.name})</span>}
                    </p>
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-gray-800">{note.releasedAt.toLocaleDateString('ja-jp')}</p>
                </div>
              </div>
            </div>
            <div className="ml-12 mt-2">
              <Link href={`/notes/${note.id}`} className="group">
                <span className="absolute inset-x-0 -top-px bottom-0" />
                <p className="text-xl font-medium font-noto-sans-jp truncate text-gray-600 group-hover:underline">
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