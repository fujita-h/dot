'use client';

import { NOTE_HEADERS_CLASS_NAME } from '@/libs/constants';
import clsx from 'clsx';
import throttle from 'lodash/throttle';
import { useEffect, useState } from 'react';
import { Link as Scroll } from 'react-scroll';

export function ScrollToc({ children: jsonString }: { children: string }) {
  const json = JSON.parse(jsonString);
  const contents: any[] = json.content;

  const [scrollMarker, setScrollMarker] = useState('');

  const handleScroll = throttle((e: Event) => {
    updateScrollMarker();
  }, 125);

  const updateScrollMarker = () => {
    const elements = Array.from(document.getElementsByClassName(NOTE_HEADERS_CLASS_NAME));
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

  const headingsForToc = contents.filter((content: any) => content.type === 'heading' && content.attrs?.level <= 2);
  return (
    <div className="flex flex-col">
      {headingsForToc.map((heading: any, index: number) => {
        return (
          <Scroll key={index} to={`${heading.content[0].text}`} smooth={true} duration={400} offset={0}>
            <div
              className={clsx(
                'text-sm',
                `${heading.content[0].text}` == scrollMarker ? 'bg-gray-200' : '',
                'py-1 px-1 hover:cursor-pointer hover:bg-gray-300',
                heading.attrs.level === 2 ? 'pl-4' : ''
              )}
            >
              {heading.content[0].text}
            </div>
          </Scroll>
        );
      })}
    </div>
  );
}
