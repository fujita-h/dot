'use server';

import blob from '@/libs/azure/storeage-blob/instance';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { getUserWithClaims } from '@/libs/prisma/user';
import { init as initCuid } from '@paralleldrive/cuid2';

const fileCuid = initCuid({ length: 24 });

export interface FileParam {
  fileName: string;
  data: string;
}

export async function uploadFiles(fileParams: FileParam[]) {
  const session = await auth();
  const { userId } = await getUserIdFromSession(session);
  if (!userId) throw new Error('userId is not defined');
  const user = await getUserWithClaims(userId);
  if (!user) throw new Error('user is not defined');
  return Promise.allSettled(
    fileParams.map((fileParam) => {
      const blobName = `${fileCuid()}`;
      const fileName = fileParam.fileName;
      const metadata = {
        userId: user.id,
        userName: user.name,
        oid: user.Claim?.oid || '',
        fileName: fileParam.fileName,
      };
      const tags = {
        userId: user.id,
        userName: user.name,
        oid: user.Claim?.oid || '',
      };
      return fetch(fileParam.data)
        .then((res) => res.blob())
        .then(async (file) =>
          blob.upload('user-uploaded-files', blobName, file.type, Buffer.from(await file.arrayBuffer()), metadata, tags)
        )
        .then(() => ({ blobName: blobName, fileName: fileName }));
    })
  );
}
