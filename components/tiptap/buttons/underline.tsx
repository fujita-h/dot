'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from './template';
import { MdFormatUnderlined } from 'react-icons/md';

export function ButtonUnderline({
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
      active={editor.isActive('underline')}
      onClick={() => editor.chain().focus().toggleUnderline().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <MdFormatUnderlined />
    </ButtonTemplate>
  );
}
