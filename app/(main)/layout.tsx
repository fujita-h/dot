import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { auth } from '@/libs/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userName = session?.user?.name || '';
  const email = session?.user?.email || '';
  return (
    <div className="min-h-screen bg-slate-100">
      <header>
        <div className="bg-white">
          <div className="max-w-screen-2xl mx-auto">
            <Navbar userName={userName} email={email} />
          </div>
        </div>
      </header>
      <main className="relative z-[1]">{children}</main>
      <footer className="sticky top-[100vh]">
        <Footer />
      </footer>
    </div>
  );
}
