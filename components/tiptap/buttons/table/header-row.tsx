'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from '../template';
import { RiLayoutRowFill } from 'react-icons/ri';

export function ButtonHeaderRow({
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
      active={false}
      onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <RiLayoutRowFill />
    </ButtonTemplate>
  );
}
