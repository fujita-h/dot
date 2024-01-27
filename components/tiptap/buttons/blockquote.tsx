'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from './template';
import { LuTextQuote } from 'react-icons/lu';

export function ButtonBlockquote({
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
  return (
    <ButtonTemplate
      id={id}
      active={editor.isActive('blockquote')}
      onClick={() => editor.chain().focus().toggleBlockquote().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <LuTextQuote />
    </ButtonTemplate>
  );
}
