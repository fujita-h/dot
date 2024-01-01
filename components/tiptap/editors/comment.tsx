'use client';

import '@/components/tiptap/tiptap.css';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import BlockquoteExtension from '@tiptap/extension-blockquote';
import BulletListExtension from '@tiptap/extension-bullet-list';
import CodeBlockExtension from '@tiptap/extension-code-block';
import DocumentExtension from '@tiptap/extension-document';
import HardBreakExtension from '@tiptap/extension-hard-break';
import HeadingExtension from '@tiptap/extension-heading';
import HorizontalRuleExtension from '@tiptap/extension-horizontal-rule';
import ListItemExtension from '@tiptap/extension-list-item';
import OrderedListExtension from '@tiptap/extension-ordered-list';
import ParagraphExtension from '@tiptap/extension-paragraph';
import TextExtension from '@tiptap/extension-text';
import BoldExtension from '@tiptap/extension-bold';
import CodeExtension from '@tiptap/extension-code';
import ItalicExtension from '@tiptap/extension-italic';
import StrikeExtension from '@tiptap/extension-strike';
import DropcursorExtension from '@tiptap/extension-dropcursor';
import GapcursorExtension from '@tiptap/extension-gapcursor';
import HistoryExtension from '@tiptap/extension-history';

export default function CommentEditor({
  noteId,
  postAction: post,
}: {
  noteId: string;
  postAction: (noteId: string, comment: string) => Promise<{ id: string }>;
}) {
  const editor = useEditor({
    extensions: [
      BlockquoteExtension,
      BulletListExtension,
      CodeBlockExtension,
      DocumentExtension,
      HardBreakExtension,
      HeadingExtension.configure({ levels: [1, 2, 3] }),
      HorizontalRuleExtension,
      ListItemExtension,
      OrderedListExtension,
      ParagraphExtension,
      TextExtension,
      BoldExtension,
      CodeExtension,
      ItalicExtension,
      StrikeExtension,
      DropcursorExtension,
      GapcursorExtension,
      HistoryExtension,
      ImageExtension,
      LinkExtension.configure({
        openOnClick: false,
      }),
      PlaceholderExtension.configure({
        placeholder: 'ここからコメントを書き始めます...',
      }),
      UnderlineExtension,
    ],
  });

  return (
    <div>
      <div className="border rounded-lg p-2">
        <EditorContent editor={editor} />
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={async () => {
            const result = await post(noteId, JSON.stringify(editor?.getJSON())).catch((e) => null);
            if (result) {
              editor?.commands.clearContent();
            }
          }}
        >
          コメントを投稿
        </button>
      </div>
    </div>
  );
}
