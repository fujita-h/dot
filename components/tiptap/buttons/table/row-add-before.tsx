'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from '../template';
import { TbRowInsertTop } from 'react-icons/tb';

export function ButtonTableRowAddBefore({
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
      onClick={() => editor.chain().focus().addRowBefore().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <TbRowInsertTop />
    </ButtonTemplate>
  );
}
