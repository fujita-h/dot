'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from '../template';
import { TbColumnInsertRight } from 'react-icons/tb';

export function ButtonTableColAddAfter({
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
      onClick={() => editor.chain().focus().addColumnAfter().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <TbColumnInsertRight />
    </ButtonTemplate>
  );
}
