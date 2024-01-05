import clsx from 'clsx/lite';
import { Inter } from 'next/font/google';
import { SITE_NAME } from '@/libs/constants';
const inter = Inter({ subsets: ['latin'] });

/**
 * Text-based logo.
 */
export function TextLogo() {
  return <span className={clsx('text-xl text-gray-700 font-semibold', inter.className)}>{SITE_NAME}</span>;
}
