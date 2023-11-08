import { Navbar } from '@/components/navbar';
import { auth } from '@/libs/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userName = session?.user?.name || '';
  const email = session?.user?.email || '';
  return (
    <div className="min-h-screen h-screen bg-slate-100">
      <header>
        <Navbar userName={userName} email={email} />
      </header>
      <main className="relative z-[1] h-[calc(100%_-_64px)]">{children}</main>
    </div>
  );
}
