import { BlobClient } from './blob-client';

const blobClientSingleton = () => {
  return new BlobClient();
};

declare global {
  var blob: undefined | ReturnType<typeof blobClientSingleton>;
}

const blob = globalThis.blob ?? blobClientSingleton();

export default blob;

if (process.env.NODE_ENV !== 'production') globalThis.blob = blob;
