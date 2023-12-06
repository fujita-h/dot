'server-only';

import blob from '@/libs/azure/storeage-blob/instance';
import { SidebarToC } from './sidebar-toc';

export async function ToC({ bodyBlobName }: { bodyBlobName: string }) {
  const body = await blob
    .downloadToBuffer('notes', bodyBlobName)
    .then((res) => res.toString('utf-8'))
    .catch((e) => '');
  return <SidebarToC body={body} />;
}
