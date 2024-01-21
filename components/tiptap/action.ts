'use server';

import { getSessionUser } from '@/libs/auth/utils';
import blob from '@/libs/azure/storeage-blob/instance';
import type { FileParam } from '@/libs/tiptap/extensions/upload-image/types';
import { init as initCuid } from '@paralleldrive/cuid2';
const fileCuid = initCuid({ length: 24 });

export async function uploadFiles(fileParams: FileParam[]) {
  const user = await getSessionUser();
  if (!user || !user.id) throw new Error('Unauthorized');
  const userId = user.id;

  return Promise.allSettled(
    fileParams.map((fileParam) => {
      const blobName = `${fileCuid()}`;
      const fileName = fileParam.fileName;
      const metadata = {
        userId: userId,
        userName: encodeURI(user.name || 'n/a'),
        oid: user.oid || 'n/a',
        uid: user.uid || 'n/a',
        fileName: encodeURI(fileParam.fileName),
      };
      const tags = {
        userId: userId,
        oid: user.oid || 'n/a',
        uid: user.uid || 'n/a',
      };
      return fetch(fileParam.fileDataURL)
        .then((res) => res.blob())
        .then(async (file) =>
          blob.upload('user-uploaded-files', blobName, file.type, Buffer.from(await file.arrayBuffer()), metadata, tags)
        )
        .then(() => ({ blobName: blobName, fileName: fileName }));
    })
  );
}
