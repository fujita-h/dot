import { EsClient } from './client';

const esClientSingleton = () => {
  return new EsClient();
};

type EsClientSingleton = ReturnType<typeof esClientSingleton>;

const globalForEs = globalThis as unknown as {
  es: EsClientSingleton | undefined;
};

const es = globalForEs.es ?? esClientSingleton();

export default es;

if (process.env.NODE_ENV !== 'production') globalForEs.es = es;
