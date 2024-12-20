import { getSessionUser } from '@/libs/auth/utils';
import blobClient from '@/libs/azure/storeage-blob/instance';
import { createDefaultTopicIconSvg } from '@/libs/image/icon';
import { nodeToWebStream } from '@/libs/utils/node-to-web-stream';

export async function GET(request: Request, props: { params: Promise<{ topicId: string }> }) {
  const params = await props.params;
  if (!params.topicId) {
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
    const blobResponse = await blobClient.download('topics', `${params.topicId}/icon`);
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
      const defaultGroupIcon = createDefaultTopicIconSvg();
      await blobClient.upload('topics', `${params.topicId}/icon`, 'image/svg+xml', defaultGroupIcon);
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
