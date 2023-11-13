'server-only';

import blob from '@/libs/azure/storeage-blob/instance';
import { ReactiveToC } from './reactive-toc';

export async function ToC({ bodyBlobName }: { bodyBlobName: string }) {
  const body = await blob
    .downloadToBuffer('notes', bodyBlobName)
    .then((res) => res.toString('utf-8'))
    .catch((e) => '');
  return <ReactiveToC body={body} />;
}
