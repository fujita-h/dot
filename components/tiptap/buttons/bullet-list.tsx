'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from './template';
import { PiListDashesFill } from 'react-icons/pi';

export function ButtonBulletList({
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
      active={editor.isActive('bulletList')}
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <PiListDashesFill />
    </ButtonTemplate>
  );
}
