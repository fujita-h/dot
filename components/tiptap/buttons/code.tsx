'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from './template';
import { MdCode } from 'react-icons/md';

export function ButtonCode({
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
      active={editor.isActive('code')}
      onClick={() => editor.chain().focus().toggleCode().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <MdCode />
    </ButtonTemplate>
  );
}
