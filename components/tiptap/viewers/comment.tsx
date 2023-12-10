'use client';

import '@/components/tiptap/tiptap.css';
import Image from '@tiptap/extension-image';
import { EditorContent, mergeAttributes, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function TipTapJsonCommentRenderer({ jsonString }: { jsonString: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.extend({
        renderHTML({ node, HTMLAttributes }) {
          return [
            'a',
            {
              href: node.attrs.src,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)],
          ];
        },
      }),
    ],
    content: JSON.parse(jsonString),
    editable: false,
  });
  return <EditorContent editor={editor} />;
}
