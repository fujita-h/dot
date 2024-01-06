'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from '../template';
import { RiLayoutColumnFill } from 'react-icons/ri';

export function ButtonHeaderCol({
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
      onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <RiLayoutColumnFill />
    </ButtonTemplate>
  );
}
