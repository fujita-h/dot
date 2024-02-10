import { Redis } from 'ioredis';

const redidClientSingleton = () => {
  const REDIS_URL = process.env.REDIS_URL;
  if (!REDIS_URL) throw new Error('REDIS_URL is not defined');
  return new Redis(REDIS_URL);
};

declare global {
  var redis: undefined | ReturnType<typeof redidClientSingleton>;
}

const redis = globalThis.redis ?? redidClientSingleton();

export default redis;

if (process.env.NODE_ENV !== 'production') globalThis.redis = redis;
