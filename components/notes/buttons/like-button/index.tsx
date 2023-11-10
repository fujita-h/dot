import { getLiked, getLikedCount } from '@/libs/prisma/like';
import { Form } from './form';

export async function LikeButton({ userId, noteId }: { userId: string; noteId: string }) {
  const [liked, count] = await Promise.all([
    getLiked(userId, noteId)
      .then((data) => !!data)
      .catch((e) => false),
    getLikedCount(noteId).catch((e) => 0),
  ]);
  return <Form noteId={noteId} liked={liked} count={count} />;
}
