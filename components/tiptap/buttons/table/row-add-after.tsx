'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from '../template';
import { TbRowInsertBottom } from 'react-icons/tb';

export function ButtonTableRowAddAfter({
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
      onClick={() => editor.chain().focus().addRowAfter().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <TbRowInsertBottom />
    </ButtonTemplate>
  );
}
