import { getSessionUser } from '@/libs/auth/utils';
import blobClient from '@/libs/azure/storeage-blob/instance';
import { createRectSvg } from '@/libs/image/rect';
import { nodeToWebStream } from '@/libs/utils/node-to-web-stream';

export async function GET(request: Request, props: { params: Promise<{ groupId: string }> }) {
  const params = await props.params;
  if (!params.groupId) {
    return new Response(null, { status: 404 });
  }
  const user = await getSessionUser();
  if (!user || !user.id) {
    return new Response(null, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const no_cache = searchParams.get('no-cache') === null ? false : true;
  const cache_control = no_cache ? 'no-store' : 'max-age=600';

  try {
    const blobResponse = await blobClient.download('groups', `${params.groupId}/image`);
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
      const defaultUserIcon = createRectSvg(0, 90, 0, 100, 85, 95);
      await blobClient.upload('groups', `${params.groupId}/image`, 'image/svg+xml', defaultUserIcon);
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
