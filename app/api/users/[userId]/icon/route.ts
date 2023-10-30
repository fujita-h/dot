import blobClient from '@/libs/azure/storeage-blob/instance';
import { auth } from '@/libs/auth';
import { getUserIdFromOid } from '@/libs/prisma/user-claim';
import { checkUserExists } from '@/libs/prisma/user';
import { unstable_cache } from 'next/cache';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  if (!params.userId) {
    return new Response(null, { status: 404 });
  }
  const session = await auth();
  const oid = session?.token?.oid;
  if (!oid) {
    return new Response(null, { status: 401 });
  }
  const sessionUserId = await getUserIdFromOid(oid).catch((e) => {
    return new Response(null, { status: 500 });
  });
  if (!sessionUserId) {
    return new Response(null, { status: 401 });
  }

  if (params.userId !== sessionUserId) {
    const check = await checkUserExists(params.userId).catch((e) => {
      return new Response(null, { status: 500 });
    });
    if (!check) {
      return new Response(null, { status: 404 });
    }
  }

  const { searchParams } = new URL(request.url);
  const use_cache = searchParams.get('no-cache') === null ? true : false;

  if (use_cache) {
    try {
      const x = await getBlobWithCache('user', `${params.userId}/icon`);
      if (x && x.buffer && x.contentType) {
        return new Response(Buffer.from(x.buffer), { headers: [['Content-Type', x.contentType]] });
      } else {
        return new Response(null, { status: 404 });
      }
    } catch (error) {
      console.log(error);
      return new Response(null, { status: 500 });
    }
  } else {
    try {
      const blobResponse = await blobClient.download('user', `${params.userId}/icon`);
      if (blobResponse.readableStreamBody && blobResponse.contentType) {
        return new Response(nodeToWebStream(blobResponse.readableStreamBody), {
          headers: [['Content-Type', blobResponse.contentType]],
        });
      } else {
        return new Response(null, { status: 404 });
      }
    } catch (error) {
      return new Response(null, { status: 500 });
    }
  }
}

const getBlobWithCache = unstable_cache(
  async (containerName: string, blobName: string) => getBlob(containerName, blobName),
  ['user-icons'],
  {
    revalidate: 60,
    tags: ['user-icons'],
  }
);

async function getBlob(containerName: string, blobName: string): Promise<{ contentType?: string; buffer: number[] }> {
  return new Promise((resolve, reject) => {
    return Promise.all([
      blobClient.getProperties(containerName, blobName),
      blobClient.downloadToBuffer(containerName, blobName),
    ])
      .then(([properties, buffer]) => {
        resolve({ contentType: properties.contentType, buffer: buffer.toJSON().data });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function nodeToWebStream(nodeStream: NodeJS.ReadableStream) {
  return new ReadableStream({
    async start(controller) {
      nodeStream.on('data', (chunk) => {
        controller.enqueue(chunk);
      });
      nodeStream.on('end', () => {
        controller.close();
      });
      nodeStream.on('error', (err) => {
        controller.error(err);
      });
    },
  });
}
