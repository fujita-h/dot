'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from '../template';
import { AiOutlineMergeCells } from 'react-icons/ai';

export function ButtonTableMerge({
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
      onClick={() => editor.chain().focus().mergeCells().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <AiOutlineMergeCells />
    </ButtonTemplate>
  );
}
