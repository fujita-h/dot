import clsx from 'clsx';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

/**
 * Text-based logo.
 */
export function TextLogo() {
  return <span className={clsx('text-xl text-gray-700 font-semibold', inter.className)}>_mdocs</span>;
}
