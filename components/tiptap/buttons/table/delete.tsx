'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from '../template';
import { RiDeleteBin2Line } from 'react-icons/ri';

export function ButtonTableDelete({
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
      onClick={() => editor.chain().focus().deleteTable().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <RiDeleteBin2Line />
    </ButtonTemplate>
  );
}
