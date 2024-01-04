'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from './template';
import { MdFormatItalic } from 'react-icons/md';

export function ButtonItalic({
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
      active={editor.isActive('italic')}
      onClick={() => editor.chain().focus().toggleItalic().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <MdFormatItalic />
    </ButtonTemplate>
  );
}
