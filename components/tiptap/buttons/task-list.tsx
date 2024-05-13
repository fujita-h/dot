'use client';

import { Editor } from '@tiptap/react';
import { PiListChecks } from 'react-icons/pi';
import { ButtonTemplate } from './template';

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
      <PiListChecks />
    </ButtonTemplate>
  );
}
