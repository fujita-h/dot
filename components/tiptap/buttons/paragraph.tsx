'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from './template';
import { BsTextParagraph } from 'react-icons/bs';

export function ButtonParagraph({
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
      active={editor.isActive('paragraph')}
      onClick={() => editor.chain().focus().setParagraph().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <BsTextParagraph />
    </ButtonTemplate>
  );
}
