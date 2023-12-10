import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { auth } from '@/libs/auth';
import { getUser } from '@/libs/prisma/user';
import { getPostableGroups } from '@/libs/prisma/group';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = session?.token?.userId || '';
  const user = userId ? await getUser(userId).catch(() => null) : null;
  const groups = userId ? await getPostableGroups(userId).catch(() => []) : [];
  return (
    <div className="min-h-screen bg-slate-100">
      <header>
        <Navbar userName={user?.name || ''} groups={groups} />
      </header>
      <main className="relative z-[1]">{children}</main>
      <footer className="sticky top-[100vh]">
        <Footer />
      </footer>
    </div>
  );
}
