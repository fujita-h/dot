'use client';

import '@/components/tiptap/tiptap.css';
import ImageExtension from '@/libs/tiptap/extensions/image';
import BlockquoteExtension from '@tiptap/extension-blockquote';
import BoldExtension from '@tiptap/extension-bold';
import BulletListExtension from '@tiptap/extension-bullet-list';
import CodeExtension from '@tiptap/extension-code';
import CodeBlockExtension from '@tiptap/extension-code-block';
import DocumentExtension from '@tiptap/extension-document';
import DropcursorExtension from '@tiptap/extension-dropcursor';
import GapcursorExtension from '@tiptap/extension-gapcursor';
import HardBreakExtension from '@tiptap/extension-hard-break';
import HeadingExtension from '@tiptap/extension-heading';
import HistoryExtension from '@tiptap/extension-history';
import HorizontalRuleExtension from '@tiptap/extension-horizontal-rule';
import ItalicExtension from '@tiptap/extension-italic';
import LinkExtension from '@tiptap/extension-link';
import ListItemExtension from '@tiptap/extension-list-item';
import OrderedListExtension from '@tiptap/extension-ordered-list';
import ParagraphExtension from '@tiptap/extension-paragraph';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import StrikeExtension from '@tiptap/extension-strike';
import TextExtension from '@tiptap/extension-text';
import UnderlineExtension from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';

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
