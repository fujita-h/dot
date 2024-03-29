import { SimplePagination } from '@/components/paginations/simple';
import { getDraftsCount, getDraftsWithGroupTopic } from '@/libs/prisma/draft';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx/lite';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const ITEMS_PER_PAGE = 10;

export async function List({ userId, id, page }: { userId: string; id?: string; page: number }) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const [drafts, count] = await Promise.all([
    getDraftsWithGroupTopic(userId, ITEMS_PER_PAGE, skip),
    getDraftsCount(userId),
  ]);

  if (!drafts || drafts.length === 0) {
    return <div>下書きがありません</div>;
  }

  const lastPage = Math.ceil(count / ITEMS_PER_PAGE);
  if (page > lastPage) {
    const params = new URLSearchParams();
    params.set('page', lastPage.toString());
    if (id) params.set('id', id);
    redirect(`/drafts?${params.toString()}`);
  }

  const searchParams = new URLSearchParams();
  if (id) {
    searchParams.set('id', id);
  }

  return (
    <div>
      {lastPage > 0 && (
        <div className="mb-3 px-1">
          <SimplePagination page={page} lastPage={lastPage} searchParams={searchParams} />
        </div>
      )}
      <ul role="list" className="grid grid-cols-1 gap-1">
        {drafts.map((draft) => {
          const params = new URLSearchParams();
          params.set('page', page.toString());
          params.set('id', draft.id);
          const href = `/drafts?${params.toString()}`;

          return (
            <li
              key={draft.id}
              className={clsx(
                'relative col-span-1 divide-y divide-gray-200 rounded-sm bg-white shadow',
                id === draft.id ? 'ring-2 ring-indigo-600' : 'hover:bg-indigo-50 hover:ring-1 hover:ring-indigo-300'
              )}
            >
              <div className="flex gap-1 p-2">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between gap-1">
                    <div className="flex items-center space-x-2 truncate">
                      {draft.Group && (
                        <img
                          src={`/api/groups/${draft.Group.id}/icon`}
                          className="h-5 w-5 flex-none rounded-md bg-gray-50"
                          alt="group-icon"
                        />
                      )}
                      <div className="text-sm w-full truncate">{draft.Group?.name || 'グループなし'}</div>
                    </div>
                    <div className="flex-none text-sm">{draft.relatedNoteId && '投稿済み'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold leading-6 text-gray-900">
                      <Link href={href}>
                        <span className="absolute inset-x-0 -top-px bottom-0" />
                      </Link>
                      <div className="truncate">{draft.title || 'タイトルなし'}</div>
                    </div>
                  </div>
                </div>
                <div className="flex-none flex items-center">
                  <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {lastPage > 0 && (
        <div className="mt-3 px-1">
          <SimplePagination page={page} lastPage={lastPage} searchParams={searchParams} />
        </div>
      )}
    </div>
  );
}
