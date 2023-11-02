import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/session';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const session = await auth();
  const { status, userId: sessionUserId, error } = await getUserIdFromSession(session);
  if (status !== 200) {
    return new Response(null, { status: status });
  }

  const { searchParams } = new URL(request.url);
  const nocache = searchParams.get('no-cache');

  redirect(`/api/users/${sessionUserId}/image` + (nocache ? `?no-cache=${nocache}` : ''));
}
