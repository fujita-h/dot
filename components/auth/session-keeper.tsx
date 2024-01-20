'use client';

import { useInterval } from '@/libs/utils/react';

export function SessionKeeper({ interval = 60 }: { interval?: number }) {
  useInterval(
    () => {
      fetch('/api/auth/session', { method: 'GET', cache: 'no-cache' })
        .then((data) => data)
        .catch(() => null);
    },
    interval * 1000,
    true
  );

  return <></>;
}
