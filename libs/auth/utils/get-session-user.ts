import { auth } from '@/libs/auth';

export async function getSessionUser() {
  const session = await auth();
  return session?.user;
}
