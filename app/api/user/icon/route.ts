import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const session = await auth();
  const { status, userId: sessionUserId, error } = await getUserIdFromSession(session, true);
  if (status !== 200) {
    return new Response(null, { status: status });
  }

  const { searchParams } = new URL(request.url);
  const nocache = searchParams.get('no-cache');

  redirect(`/api/users/${sessionUserId}/icon` + (nocache ? `?no-cache=${nocache}` : ''));
}
