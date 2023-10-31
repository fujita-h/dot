import { auth } from '@/libs/auth';
import { getUserIdFromOid } from '@/libs/prisma/user-claim';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const session = await auth();
  const oid = session?.token?.oid;
  if (!oid) {
    return new Response(null, { status: 401 });
  }

  const sessionUserId = await getUserIdFromOid(oid).catch((e) => {
    return new Response(null, { status: 500 });
  });
  if (!sessionUserId) {
    return new Response(null, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const nocache = searchParams.get('no-cache');

  redirect(`/api/users/${sessionUserId}/image` + (nocache ? `?no-cache=${nocache}` : ''));
}
