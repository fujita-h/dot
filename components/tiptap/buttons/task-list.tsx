'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from './template';
import { LuListChecks } from 'react-icons/lu';

export function ButtonTaskList({
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
      active={editor.isActive('taskList')}
      onClick={() => editor.chain().focus().toggleTaskList().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <LuListChecks />
    </ButtonTemplate>
  );
}
