'use server';

import blob from '@/libs/azure/storeage-blob/instance';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { init as initCuid } from '@paralleldrive/cuid2';

const fileCuid = initCuid({ length: 24 });

export interface FileParam {
  fileName: string;
  data: string;
}

export async function uploadFiles(files: FileParam[]) {
  const session = await auth();
  const { userId } = await getUserIdFromSession(session, true);
  return Promise.allSettled(
    files.map((file) => {
      const blobName = `${userId}/uploaded/${fileCuid()}`;
      return blob
        .upload('user', blobName, 'image/png', Buffer.from(file.data))
        .then(() => ({ blobName: blobName, fileName: file.fileName }));
    })
  );
}
