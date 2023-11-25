'server-only';

import redis from '@/libs/redis/instance';

export function incrementAccess(noteId: string, groupId?: string | null) {
  const date = new Date().toISOString().split('T')[0];
  const key = `notes/access/${date}`;
  const member = groupId ? `${groupId}/${noteId}` : `/${noteId}`;
  const expire = 60 * 60 * 24 * 30; // 30 days
  return redis
    .multi()
    .zincrby(key, 1, member)
    .expire(key, expire)
    .exec()
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while incrementing access');
    });
}
