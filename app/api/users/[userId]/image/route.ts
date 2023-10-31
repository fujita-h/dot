import { auth } from '@/libs/auth';
import blobClient from '@/libs/azure/storeage-blob/instance';
import { createRectSvg } from '@/libs/image/rect';
import { checkUserExists } from '@/libs/prisma/user';
import { getUserIdFromOid } from '@/libs/prisma/user-claim';

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
  const no_cache = searchParams.get('no-cache') === null ? false : true;
  const cache_control = no_cache ? 'no-store' : 'max-age=600';

  try {
    const blobResponse = await blobClient.download('user', `${params.userId}/image`);
    if (blobResponse.readableStreamBody && blobResponse.contentType) {
      return new Response(nodeToWebStream(blobResponse.readableStreamBody), {
        headers: [
          ['Content-Type', blobResponse.contentType],
          ['Cache-Control', cache_control],
        ],
      });
    }
    return new Response(null, { status: 500 });
  } catch (error: any) {
    if (error.statusCode === 404) {
      const defaultUserIcon = createRectSvg(90, 270, 0, 100, 85, 95);
      await blobClient.upload('user', `${params.userId}/image`, 'image/svg+xml', defaultUserIcon);
      return new Response(defaultUserIcon, {
        headers: [
          ['Content-Type', 'image/svg+xml'],
          ['Cache-Control', cache_control],
        ],
      });
    }
    return new Response(null, { status: 500 });
  }
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
