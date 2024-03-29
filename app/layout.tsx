import { SessionKeeper } from '@/components/auth';
import { SITE_NAME } from '@/libs/constants';
import clsx from 'clsx/lite';
import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP, Source_Code_Pro } from 'next/font/google';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-sans-jp' });
const sourceCodePro = Source_Code_Pro({ subsets: ['latin'], variable: '--font-source-code-pro' });

export const metadata: Metadata = {
  title: SITE_NAME,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sessionInterval = Number(process.env.AUTH_SESSION_UPDATE_AGE) || undefined;
  return (
    <html lang="ja" className="overflow-y-scroll">
      <body
        className={clsx(
          // default fonts
          'font-default',
          // optional fonts
          inter.variable,
          notoSansJP.variable,
          sourceCodePro.variable
        )}
      >
        {children}
      </body>
      <SessionKeeper interval={sessionInterval} />
    </html>
  );
}
