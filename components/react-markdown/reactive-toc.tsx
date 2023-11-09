'use client';

import { CONTENT_ANCHOR_CLASS_NAME, CONTENT_ANCHOR_PREFIX } from '@/libs/constants';
import clsx from 'clsx';
import throttle from 'lodash/throttle';
import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link as Scroll } from 'react-scroll';

export function ReactiveToC({ children }: { children: string }) {
  const [scrollMarker, setScrollMarker] = useState('');

  const handleScroll = throttle((e: Event) => {
    updateScrollMarker();
  }, 125);

  const updateScrollMarker = () => {
    const elements = Array.from(document.getElementsByClassName(CONTENT_ANCHOR_CLASS_NAME));
    const targets = elements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { id: element.id, top: rect.top - 1 };
      })
      .sort((a, b) => b.top - a.top);
    const target = targets.find((x) => x.top < 0) ?? targets.slice(-1)[0];
    setScrollMarker(target?.id ?? '');
  };

  useEffect(() => {
    document.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollMarker();
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  });

  const H1 = useCallback(
    ({ node, ...props }: any) => {
      return (
        <Scroll
          to={`${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}`}
          smooth={true}
          duration={400}
          offset={0}
        >
          <div
            className={clsx(
              `${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}` == scrollMarker ? 'bg-gray-200' : '',
              'py-1 px-1 hover:cursor-pointer hover:bg-gray-300'
            )}
          >
            {props.children}
          </div>
        </Scroll>
      );
    },
    [scrollMarker]
  );

  const H2 = useCallback(
    ({ node, ...props }: any) => {
      return (
        <Scroll
          to={`${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}`}
          smooth={true}
          duration={400}
          offset={0}
        >
          <div
            className={clsx(
              `${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}` == scrollMarker ? 'bg-gray-200' : '',
              'py-1 pl-3 pr-1 hover:cursor-pointer hover:bg-gray-300'
            )}
          >
            {props.children}
          </div>
        </Scroll>
      );
    },
    [scrollMarker]
  );

  return (
    <ReactMarkdown className="text-sm text-zinc-700" allowedElements={['h1', 'h2']} components={{ h1: H1, h2: H2 }}>
      {children}
    </ReactMarkdown>
  );
}
