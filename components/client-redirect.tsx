'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Client-side component to redirect to a URL.
 * @param url - The URL to redirect to.
 * @param method - The method to use for redirection. Defaults to `replace`.
 */
export async function ClientRedirect({ url, method = 'replace' }: { url: string; method?: 'replace' | 'push' }) {
  const router = useRouter();
  useEffect(() => {
    if (!router || !url) return;
    switch (method) {
      case 'replace':
        router.replace(url);
        break;
      case 'push':
        router.push(url);
        break;
      default:
        router.replace(url);
    }
  }, [router, url, method]);
  return <></>;
}
