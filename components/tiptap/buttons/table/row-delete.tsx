'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from '../template';
import { TbRowRemove } from 'react-icons/tb';

export function ButtonTableRowDelete({
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
      onClick={() => editor.chain().focus().deleteRow().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <TbRowRemove />
    </ButtonTemplate>
  );
}
