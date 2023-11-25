import { getReadableGroups } from '@/libs/prisma/group';
import { getNoteWithUserGroupTopics } from '@/libs/prisma/note';
import { getTrendingNotes } from '@/libs/redis/trending';
import { StackList, Note } from '@/components/notes/stack-list';

export async function TrendingNotes({ userId }: { userId: string }) {
  const [trendingNoteKeys, readableGroups] = await Promise.all([
    getTrendingNotes().catch(() => []),
    getReadableGroups(userId)
      .then((data) => data.map((group) => group.id).filter((groupId) => groupId))
      .catch(() => [] as string[]),
  ]);

  const notes = await Promise.all(
    trendingNoteKeys
      .map((key) => key.split('/'))
      .filter((arr) => arr.length === 2)
      .map((arr) => ({ groupId: arr[0], noteId: arr[1] }))
      .filter(({ groupId }) => !groupId || readableGroups.includes(groupId))
      .slice(0, 20)
      .map(({ noteId }) => getNoteWithUserGroupTopics(noteId, userId).catch(() => null))
  );

  return <StackList notes={notes.filter((note) => note !== null) as Note[]} />;
}
