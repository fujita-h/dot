'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from '../template';
import { TbColumnRemove } from 'react-icons/tb';

export function ButtonTableColDelete({
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
      onClick={() => editor.chain().focus().deleteColumn().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <TbColumnRemove />
    </ButtonTemplate>
  );
}
