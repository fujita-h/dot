import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import blobClient from '@/libs/azure/storeage-blob/instance';
import { createDefaultUserIconSvg } from '@/libs/image/icon';
import { nodeToWebStream } from '@/libs/utils/node-to-web-stream';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  if (!params.userId) {
    return new Response(null, { status: 404 });
  }
  const session = await auth();
  const { status } = await getUserIdFromSession(session, true);
  if (status !== 200) {
    return new Response(null, { status: status });
  }

  const { searchParams } = new URL(request.url);
  const no_cache = searchParams.get('no-cache') === null ? false : true;
  const cache_control = no_cache ? 'no-store' : 'max-age=600';

  try {
    const blobResponse = await blobClient.download('users', `${params.userId}/icon`);
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
      const defaultUserIcon = createDefaultUserIconSvg(0, 360, 0, 100, 30, 80);
      await blobClient.upload('users', `${params.userId}/icon`, 'image/svg+xml', defaultUserIcon);
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
