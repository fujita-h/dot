'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from './template';
import { LuTable } from 'react-icons/lu';

export function ButtonTable({
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
      active={editor.isActive('table')}
      onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <LuTable />
    </ButtonTemplate>
  );
}
