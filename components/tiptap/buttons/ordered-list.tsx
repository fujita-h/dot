'use client';

import { Editor } from '@tiptap/react';
import { PiListNumbers } from 'react-icons/pi';
import { ButtonTemplate } from './template';

export function ButtonOrderedList({
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
      active={editor.isActive('orderedList')}
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <PiListNumbers />
    </ButtonTemplate>
  );
}
