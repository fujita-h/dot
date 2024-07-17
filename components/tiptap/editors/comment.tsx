'use client';

import { useEffect, useRef } from 'react';
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
import { CommentEditorLoader } from '@/components/loaders';

import '@/components/tiptap/tiptap.css';

export default function CommentEditor({
  setting,
  noteId,
  commentId,
  body,
  postAction,
  onSuccess,
  cancelAction,
}: {
  setting: UserSetting;
  noteId: string;
  commentId?: string;
  body?: string;
  postAction: (noteId: string, commentId: string | null, body: string) => Promise<{ id: string } | { error: string }>;
  onSuccess?: () => void;
  cancelAction?: () => void;
}) {
  // if commnetId is not set, this editor is for new comment.
  // if commentId is set, this editor is for editing comment.
  const isEdit = !!commentId;
  const commentDivId = `comment-${commentId || 'new'}`;

  let content: any = undefined;
  try {
    content = body ? JSON.parse(body) : '';
  } catch (e) {
    content = body || '';
  }

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
    content: content,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!editor || !editorRef.current) {
      return;
    }
    const target = editorRef.current;

    // Tab key handling. Prevent tab key from moving focus to outside of the editor.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        return;
      }

      // Collect focusable elements
      const focusableElements = Array.from(document.querySelectorAll(`#${commentDivId} #comment-editor button`)).filter(
        (element: any) => element.tabIndex >= 0 && !element.disabled && element.offsetParent != null
      );

      // If there are no focusable elements, do nothing
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      // Find first and last focusable elements
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      // Control focus. If shift + tab key pressed, move focus to the last element. If tab key pressed, move focus to the first element.
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    // Add event listener
    target.addEventListener('keydown', handleKeyDown);

    // Remove event listener when component unmounts
    return () => {
      target.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, editorRef]);

  if (!editor) return <CommentEditorLoader />;
  return (
    <div id={`${commentDivId}`}>
      {editor && (
        <>
          <StickyMenu editor={editor} />
          <div className="border border-t-0 border-gray-300 rounded-b-lg p-2 min-h-40">
            <BubbleMenuImage editor={editor} />
            <BubbleMenuLink editor={editor} />
            <BubbleMenuTable editor={editor} />
            <BubbleMenuTextSelected editor={editor} />
            {setting.editorShowNewLineFloatingMenu && <FloatingMenuNewLine editor={editor} />}
            <div id="comment-editor" ref={editorRef}>
              <EditorContent editor={editor} />
            </div>
          </div>
          {isEdit ? (
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
                onClick={async () => {
                  cancelAction?.();
                }}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={async () => {
                  const result = await postAction(noteId, commentId, JSON.stringify(editor?.getJSON())).catch(
                    (e) => null
                  );
                  if (!result || (result && 'error' in result)) {
                    return;
                  }
                  if (result && result.id) {
                    editor?.commands.clearContent();
                    onSuccess?.();
                  }
                }}
              >
                更新
              </button>
            </div>
          ) : (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={async () => {
                  const result = await postAction(noteId, null, JSON.stringify(editor?.getJSON())).catch((e) => null);
                  if (result) {
                    editor?.commands.clearContent();
                  }
                }}
              >
                コメントを投稿
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
