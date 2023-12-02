import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { Note, StackList } from '@/components/notes/stack-list';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import es from '@/libs/elasticsearch/instance';
import { getReadableGroups } from '@/libs/prisma/group';
import { SearchForm } from './form';

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  const groups = await getReadableGroups(userId)
    .then((groups) => groups.map((g) => g.id))
    .then((groupIds) => [...groupIds, 'NULL'])
    .catch((e) => []);

  const q = (searchParams.q as string) || undefined;
  if (!q) {
    return <></>;
  }

  const esResults = await es.search('notes', {
    _source: ['title', 'releasedAt', 'userId', 'groupId', 'User.handle', 'User.name', 'Group.handle', 'Group.name'],
    query: {
      bool: {
        must: [
          {
            simple_query_string: {
              query: q,
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
  });

  // ToDo: Which is better, to use _source or retrieve from DB?
  const notes: Note[] = esResults.hits.hits.map((hit: any) => {
    const source = hit._source;
    const User = { id: source.userId, handle: source.User.handle, name: source.User.name };
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
      <div className="my-3">
        <SearchForm q={q} />
      </div>
      <div className="bg-white rounded-md p-2">
        <StackList notes={notes} />
      </div>
    </div>
  );
}
