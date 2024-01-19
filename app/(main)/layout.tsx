import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { getSessionUser } from '@/libs/auth/utils';
import { getPostableGroups } from '@/libs/prisma/group';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const groups = user?.id ? await getPostableGroups(user.id).catch(() => []) : [];
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
