import { auth } from '@/libs/auth';
import blobClient from '@/libs/azure/storeage-blob/instance';
import { createRectSvg } from '@/libs/image/rect';
import { getUserId } from '@/libs/prisma/user';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { nodeToWebStream } from '@/libs/utils/node-to-web-stream';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  if (!params.userId) {
    return new Response(null, { status: 404 });
  }
  const session = await auth();
  const { status, userId: sessionUserId, error } = await getUserIdFromSession(session, true);
  if (status !== 200) {
    return new Response(null, { status: status });
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
