import clsx from 'clsx';
import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-sans-jp' });

export const metadata: Metadata = {
  title: 'mdocs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="overflow-y-scroll">
      <body
        className={clsx(
          // default fonts
          inter.className,
          // optional fonts
          inter.variable,
          notoSansJP.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
