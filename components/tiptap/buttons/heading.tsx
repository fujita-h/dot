'use client';

import { Editor } from '@tiptap/react';
import { ButtonTemplate } from './template';
import { LuHeading1, LuHeading2, LuHeading3 } from 'react-icons/lu';

export function ButtonHeading1({
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
      active={editor.isActive('heading', { level: 1 })}
      onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <LuHeading1 />
    </ButtonTemplate>
  );
}

export function ButtonHeading2({
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
      active={editor.isActive('heading', { level: 2 })}
      onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <LuHeading2 />
    </ButtonTemplate>
  );
}

export function ButtonHeading3({
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
      active={editor.isActive('heading', { level: 3 })}
      onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
      prevButtonId={prevButtonId}
      nextButtonId={nextButtonId}
    >
      <LuHeading3 />
    </ButtonTemplate>
  );
}
