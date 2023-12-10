'server-only';

import redis from '@/libs/redis/instance';

export async function getTrendingNotes(limit: number = 65535) {
  const key = 'notes/trending';
  const trendingNotes = await redis.zrange(key, '+inf', 0, 'BYSCORE', 'REV', 'LIMIT', 0, limit).catch((e) => {
    console.error(e);
    throw new Error('Error occurred while getting trending notes');
  });

  // If there are trending notes, return them
  if (trendingNotes.length) return trendingNotes;

  // If there are no trending notes, union trending notes and return them
  await unionTrendingNotes();
  return await redis.zrange(key, '+inf', 0, 'BYSCORE', 'REV', 'LIMIT', 0, limit).catch((e) => {
    console.error(e);
    throw new Error('Error occurred while getting trending notes');
  });
}

export async function unionTrendingNotes() {
  const key = 'notes/trending';
  const period = 28;
  const expire = 60 * 60; // 60 mins
  const keys = [];
  for (let i = 0; i < period; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    keys.push(`notes/access/${dateStr}`);
  }
  return redis
    .multi()
    .zunionstore(key, period, ...keys)
    .expire(key, expire)
    .exec()
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while union trending notes');
    });
}
