'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from '../template';
import { TbColumnInsertLeft } from 'react-icons/tb';

export function ButtonTableColAddBefore({
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
      onClick={() => editor.chain().focus().addColumnBefore().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <TbColumnInsertLeft />
    </ButtonTemplate>
  );
}
