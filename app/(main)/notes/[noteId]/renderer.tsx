'use client';

import Image from '@tiptap/extension-image';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export function TipTapJsonRenderer({ jsonString }: { jsonString: string }) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: JSON.parse(jsonString),
    editable: false,
  });
  return <EditorContent editor={editor} />;
}
