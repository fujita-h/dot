'server-only';

import { Parser } from '@/components/react-markdown/parser';
import blob from '@/libs/azure/storeage-blob/instance';

export async function Body({ containerName, bodyBlobName }: { containerName: string; bodyBlobName: string }) {
  const body = await blob
    .downloadToBuffer(containerName, bodyBlobName)
    .then((res) => res.toString('utf-8'))
    .catch((e) => '');

  return <Parser>{body}</Parser>;
}
