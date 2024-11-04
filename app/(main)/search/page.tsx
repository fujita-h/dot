import { SignInForm } from '@/components/auth';
import { Note, StackList } from '@/components/notes/stack-list';
import { getSessionUser } from '@/libs/auth/utils';
import es from '@/libs/elasticsearch/instance';
import { getReadableGroups } from '@/libs/prisma/group';
import { Suspense } from 'react';
import { SearchForm } from './form';

export default async function Page(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;

  const query = (searchParams.q as string) || '';

  if (!query) {
    return (
      <div>
        <div className="my-3">
          <SearchForm q={query} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="my-3">
        <SearchForm q={query} />
      </div>
      <Suspense
        key={JSON.stringify(query)}
        fallback={
          <div className="flex justify-center" aria-label="読み込み中">
            <div className="mt-8 animate-spin h-10 w-10 border-[5px] border-indigo-500 rounded-full border-t-transparent"></div>
          </div>
        }
      >
        <ResultWrapper userId={user.id} query={query} />
      </Suspense>
    </div>
  );
}

async function ResultWrapper({ userId, query }: { userId: string; query: string }) {
  const groups = await getReadableGroups(userId)
    .then((groups) => groups.map((g) => g.id))
    .then((groupIds) => [...groupIds, 'NULL'])
    .catch((e) => []);
  const [esResults] = await Promise.all([
    es.search('notes', {
      _source: [
        'title',
        'releasedAt',
        'userId',
        'groupId',
        'User.uid',
        'User.handle',
        'User.name',
        'Group.handle',
        'Group.name',
      ],
      query: {
        bool: {
          must: [
            {
              simple_query_string: {
                query: query,
                fields: ['title^2', 'title.ngram', 'body^2', 'body.ngram'],
                default_operator: 'AND',
              },
            },
          ],
          filter: [
            {
              bool: {
                should: [{ terms: { groupId: groups } }],
                minimum_should_match: 1,
              },
            },
          ],
        },
      },
    }),
    sleep(500),
  ]);

  // ToDo: Which is better, to use _source or retrieve from DB?
  const notes: Note[] = esResults.hits.hits.map((hit: any) => {
    const source = hit._source;
    const User = { id: source.userId, uid: source.User.uid, handle: source.User.handle, name: source.User.name };
    const Group = source.groupId ? { id: source.groupId, handle: source.Group.handle, name: source.Group.name } : null;
    return {
      id: hit._id,
      title: source.title,
      releasedAt: new Date(source.releasedAt),
      User,
      Group,
    };
  });

  return (
    <div>
      {notes.length === 0 && <ResultEmpty query={query} />}
      {notes.length > 0 && <Result query={query} notes={notes} />}
    </div>
  );
}

function ResultEmpty({ query }: { query: string }) {
  return (
    <div>
      <div className="p-2 text-base">
        <span className="text-gray-800 font-semibold">{query}</span>
        <span className="text-gray-500"> の検索結果:</span>
      </div>
      <div className="bg-white rounded-md p-6 text-center">
        <div className="text-2xl font-bold">No results</div>
        <div className="text-gray-600">検索結果がありません</div>
      </div>
    </div>
  );
}

function Result({ query, notes }: { query: string; notes: Note[] }) {
  return (
    <div>
      <div className="p-2 text-base">
        <span className="text-gray-800 font-semibold">{query}</span>
        <span className="text-gray-500"> の検索結果:</span>
      </div>
      <div className="bg-white rounded-md p-2">
        <StackList notes={notes} />
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
