import prisma from '@/libs/prisma/instance';
import { auth } from '@/libs/auth';
export default async function Page() {
  const session = await auth();

  return <>home page</>;
}
