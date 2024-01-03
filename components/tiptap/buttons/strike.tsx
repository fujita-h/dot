'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from './template';
import { MdFormatStrikethrough } from 'react-icons/md';

export function ButtonStrike({
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
      active={editor.isActive('strike')}
      onClick={() => editor.chain().focus().toggleStrike().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <MdFormatStrikethrough />
    </ButtonTemplate>
  );
}
