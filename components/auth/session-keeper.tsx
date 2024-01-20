'use client';

import { useInterval } from '@/libs/utils/react';

export function SessionKeeper({ interval = 60, timeout = 5000 }: { interval?: number; timeout?: number }) {
  useInterval(
    () => {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeout);
      fetch('/api/auth/session', { method: 'GET', cache: 'no-cache', signal: abortController.signal })
        .then((data) => data)
        .catch(() => null)
        .finally(() => clearTimeout(timeoutId));
    },
    interval * 1000,
    true
  );

  return <></>;
}
