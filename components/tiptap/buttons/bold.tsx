'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from './template';
import { MdFormatBold } from 'react-icons/md';

export function ButtonBold({
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
      active={editor.isActive('bold')}
      onClick={() => editor.chain().focus().toggleBold().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <MdFormatBold />
    </ButtonTemplate>
  );
}
