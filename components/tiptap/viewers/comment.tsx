'use client';

import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import { EditorContent, mergeAttributes, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import '@/components/tiptap/tiptap.css';

export default function TipTapJsonCommentRenderer({ jsonString }: { jsonString: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.extend({
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
      LinkExtension,
      UnderlineExtension,
    ],
    content: JSON.parse(jsonString),
    editable: false,
  });
  return <EditorContent editor={editor} />;
}
