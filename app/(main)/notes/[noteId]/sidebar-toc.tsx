'use client';

import dynamic from 'next/dynamic';

const DynamicScrollToc = dynamic(() => import('@/components/tiptap/scroll-toc').then((mod) => mod.ScrollToc), {
  ssr: false,
});

export function SidebarToC({ body }: { body: string }) {
  return <DynamicScrollToc>{body}</DynamicScrollToc>;
}
