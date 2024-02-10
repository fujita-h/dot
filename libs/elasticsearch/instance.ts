import { EsClient } from './client';

const esClientSingleton = () => {
  return new EsClient();
};

declare global {
  var es: undefined | ReturnType<typeof esClientSingleton>;
}

const es = globalThis.es ?? esClientSingleton();

export default es;

if (process.env.NODE_ENV !== 'production') globalThis.es = es;
