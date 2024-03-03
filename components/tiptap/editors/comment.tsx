'use client';

import type { UserSetting } from './types';

// TipTap
import { uploadFiles } from '@/components/tiptap/action';
import {
  BubbleMenuImage,
  BubbleMenuLink,
  BubbleMenuTable,
  BubbleMenuTextSelected,
  FloatingMenuNewLine,
  StickyMenu,
} from '@/components/tiptap/menus';
import CodeBlockLowlightExtension from '@/libs/tiptap/extensions/code-block-lowlight';
import BlockquoteExtension from '@/libs/tiptap/extensions/highlite-blockquote';
import ImageExtension from '@/libs/tiptap/extensions/image';
import SelectionMarkerExtension from '@/libs/tiptap/extensions/selection-marker';
import UploadImageExtension from '@/libs/tiptap/extensions/upload-image';
import BoldExtension from '@tiptap/extension-bold';
import BulletListExtension from '@tiptap/extension-bullet-list';
import CodeExtension from '@tiptap/extension-code';
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
import TableExtension from '@tiptap/extension-table';
import TableCellExtension from '@tiptap/extension-table-cell';
import TableHeaderExtension from '@tiptap/extension-table-header';
import TableRowExtension from '@tiptap/extension-table-row';
import TaskItemExtension from '@tiptap/extension-task-item';
import TaskListExtension from '@tiptap/extension-task-list';
import TextExtension from '@tiptap/extension-text';
import UnderlineExtension from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';

import '@/components/tiptap/tiptap.css';

export default function CommentEditor({
  setting,
  noteId,
  postAction: post,
}: {
  setting: UserSetting;
  noteId: string;
  postAction: (noteId: string, comment: string) => Promise<{ id: string }>;
}) {
  const editor = useEditor({
    extensions: [
      BlockquoteExtension,
      BulletListExtension,
      CodeBlockLowlightExtension,
      DocumentExtension,
      HardBreakExtension,
      HeadingExtension.configure({ levels: [1, 2, 3] }),
      HorizontalRuleExtension,
      ListItemExtension,
      OrderedListExtension,
      TaskListExtension,
      TaskItemExtension.configure({ nested: true }),
      ParagraphExtension,
      TextExtension,
      BoldExtension,
      CodeExtension,
      ItalicExtension,
      StrikeExtension,
      DropcursorExtension,
      GapcursorExtension,
      HistoryExtension,
      TableExtension.configure({
        resizable: true,
      }),
      TableRowExtension,
      TableHeaderExtension,
      TableCellExtension,
      ImageExtension,
      SelectionMarkerExtension.configure({
        HTMLAttributes: { class: 'selection-marker' },
      }),
      UploadImageExtension.configure({
        uploadImageFunc: uploadFiles,
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
      }),
      PlaceholderExtension.configure({
        placeholder: 'ここからコメントを書き始めます...',
      }),
    ],
  });

  return (
    <div>
      {editor && (
        <>
          <StickyMenu editor={editor} />
          <div className="border border-t-0 border-gray-300 rounded-b-lg p-2 min-h-40">
            <BubbleMenuImage editor={editor} />
            <BubbleMenuLink editor={editor} />
            <BubbleMenuTable editor={editor} />
            <BubbleMenuTextSelected editor={editor} />
            {setting.editorShowNewLineFloatingMenu && <FloatingMenuNewLine editor={editor} />}
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
        </>
      )}
    </div>
  );
}
