import { BlobClient } from './blob-client';

const blobClientSingleton = () => {
  return new BlobClient();
};

type BlobClientSingleton = ReturnType<typeof blobClientSingleton>;

const globalForBlob = globalThis as unknown as {
  blob: BlobClientSingleton | undefined;
};

const blob = globalForBlob.blob ?? blobClientSingleton();

export default blob;

if (process.env.NODE_ENV !== 'production') globalForBlob.blob = blob;
