import { getSessionUser } from '@/libs/auth/utils';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user || !user.id) {
    return new Response(null, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const nocache = searchParams.get('no-cache');

  redirect(`/api/users/${user.uid}/icon` + (nocache ? `?no-cache=${nocache}` : ''));
}
