import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import blob from '@/libs/azure/storeage-blob/instance';
import { nodeToWebStream } from '@/libs/utils/node-to-web-stream';

export async function GET(request: Request, { params }: { params: { blobId: string } }) {
  const session = await auth();
  const { status } = await getUserIdFromSession(session, true);
  if (status !== 200) {
    return new Response(null, { status: status });
  }

  try {
    const blobResponse = await blob.download('user-uploaded-files', `${params.blobId}`);
    if (blobResponse.readableStreamBody && blobResponse.contentType) {
      return new Response(nodeToWebStream(blobResponse.readableStreamBody), {
        headers: [
          ['Content-Type', blobResponse.contentType],
          ['Cache-Control', 'max-age=86400'],
        ],
      });
    }
    return new Response(null, { status: 500 });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return new Response(null, { status: 404 });
    }
    return new Response(null, { status: 500 });
  }
}
