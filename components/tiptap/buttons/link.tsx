'use client';

import { Editor } from '@tiptap/react';
import clsx from 'clsx/lite';
import { useEffect, useState } from 'react';
import { FaLink } from 'react-icons/fa6';
import { InputLinkFrom } from '../forms';

export function ButtonLink({
  editor,
  id,
  prevButtonId,
  nextButtonId,
}: {
  editor: Editor;
  id?: string;
  prevButtonId?: string;
  nextButtonId?: string;
}) {
  const isLinkActive = editor.isActive('link');
  const isMarkerActive = editor.isActive('selection-marker');
  const href = editor.getAttributes('link').href || '';

  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    setShowInput(isMarkerActive);
  }, [isLinkActive, isMarkerActive]);

  return (
    <>
      <button
        id={id}
        type="button"
        className={clsx(
          isLinkActive ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
          'px-1 group rounded-md focus:outline-1 focus:outline-gray-500'
        )}
        onClick={() => {
          if (isMarkerActive) {
            editor.chain().focus().unsetSelectionMarker().run();
          } else {
            editor.chain().focus().setSelectionMarker().run();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            if (prevButtonId) {
              e.preventDefault();
              document.getElementById(prevButtonId)?.focus();
            }
          }
          if (e.key === 'ArrowRight') {
            if (nextButtonId) {
              e.preventDefault();
              document.getElementById(nextButtonId)?.focus();
            }
          }
        }}
      >
        <span className={isLinkActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}>
          <FaLink />
        </span>
      </button>
      <div className="relative">
        <div className="absolute bottom-[40px] right-[-200px] z-10 " hidden={!showInput}>
          <InputLinkFrom
            href={href}
            onUpdate={(href) => {
              editor.chain().focus().unsetSelectionMarker().setLink({ href: href }).run();
            }}
          />
        </div>
      </div>
    </>
  );
}
