'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from '../template';
import { AiOutlineSplitCells } from 'react-icons/ai';

export function ButtonTableSplit({
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
      onClick={() => editor.chain().focus().splitCell().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <AiOutlineSplitCells />
    </ButtonTemplate>
  );
}
