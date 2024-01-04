'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from './template';
import { AiOutlineCode } from 'react-icons/ai';

export function ButtonCodeBlock({
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
      active={editor.isActive('codeBlock')}
      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <AiOutlineCode />
    </ButtonTemplate>
  );
}
