'use client';

import dynamic from 'next/dynamic';

const DynamicReactiveToC = dynamic(
  () => import('@/components/react-markdown/reactive-toc').then((mod) => mod.ReactiveToC),
  { ssr: false }
);

export async function ReactiveToC({ body }: { body: string }) {
  return <DynamicReactiveToC>{body}</DynamicReactiveToC>;
}
