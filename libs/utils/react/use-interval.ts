import { useEffect, useRef } from 'react';

/**
 * Custom React hook for executing a function repeatedly at a specified interval.
 *
 * @param fn - The function to be executed.
 * @param interval - The interval (in milliseconds) at which the function should be executed.
 * @param runOnMount - Optional flag indicating whether the function should be executed immediately on mount.
 */
export function useInterval(fn: () => void, interval: number, runOnMount = false) {
  if (runOnMount) {
    fn();
  }

  const callbackRef = useRef<() => void>(fn);
  useEffect(() => {
    callbackRef.current = fn;
  }, [fn]);

  useEffect(() => {
    const tick = () => {
      callbackRef.current();
    };
    const id = setInterval(tick, interval);
    return () => {
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
