import { getSessionUser } from '@/libs/auth/utils';
import blobClient from '@/libs/azure/storeage-blob/instance';
import { createDefaultGroupIconSvg } from '@/libs/image/icon';
import { nodeToWebStream } from '@/libs/utils/node-to-web-stream';

export async function GET(request: Request, { params }: { params: { groupId: string } }) {
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
    const blobResponse = await blobClient.download('groups', `${params.groupId}/icon`);
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
      const defaultGroupIcon = createDefaultGroupIconSvg(0, 360, 0, 100, 30, 80);
      await blobClient.upload('groups', `${params.groupId}/icon`, 'image/svg+xml', defaultGroupIcon);
      return new Response(defaultGroupIcon, {
        headers: [
          ['Content-Type', 'image/svg+xml'],
          ['Cache-Control', cache_control],
        ],
      });
    }
    return new Response(null, { status: 500 });
  }
}
