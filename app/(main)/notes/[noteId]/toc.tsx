import { ReactiveToC } from '@/components/react-markdown/reactive-toc';
import blob from '@/libs/azure/storeage-blob/instance';

export async function ToC({ bodyBlobName }: { bodyBlobName: string }) {
  const body = await blob
    .downloadToBuffer('notes', bodyBlobName)
    .then((res) => res.toString('utf-8'))
    .catch((e) => '');

  return <ReactiveToC>{body}</ReactiveToC>;
}
