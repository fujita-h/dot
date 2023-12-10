import { Redis } from 'ioredis';

const redidClientSingleton = () => {
  const REDIS_URL = process.env.REDIS_URL;
  if (!REDIS_URL) throw new Error('REDIS_URL is not defined');
  return new Redis(REDIS_URL);
};

type RedisClient = ReturnType<typeof redidClientSingleton>;

const globalForRedis = globalThis as unknown as {
  redis: RedisClient | undefined;
};

const redis = globalForRedis.redis ?? redidClientSingleton();

export default redis;

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
