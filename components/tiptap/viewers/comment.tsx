'use client';

// TipTap
import CodeBlockLowlightExtension from '@/libs/tiptap/extensions/code-block-lowlight';
import BlockquoteExtension from '@/libs/tiptap/extensions/highlite-blockquote';
import ImageExtension from '@/libs/tiptap/extensions/image';
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
import StrikeExtension from '@tiptap/extension-strike';
import TableExtension, { createColGroup } from '@tiptap/extension-table';
import TableCellExtension from '@tiptap/extension-table-cell';
import TableHeaderExtension from '@tiptap/extension-table-header';
import TableRowExtension from '@tiptap/extension-table-row';
import TaskItemExtension from '@tiptap/extension-task-item';
import TaskListExtension from '@tiptap/extension-task-list';
import TextExtension from '@tiptap/extension-text';
import UnderlineExtension from '@tiptap/extension-underline';
import { DOMOutputSpec } from '@tiptap/pm/model';
import { EditorContent, mergeAttributes, useEditor } from '@tiptap/react';

import { CommentLoader } from '@/components/loaders';

import '@/components/tiptap/tiptap.css';

export default function TipTapJsonCommentRenderer({ jsonString }: { jsonString: string }) {
  try {
    const editor = useEditor({
      extensions: [
        BlockquoteExtension,
        BulletListExtension,
        CodeBlockLowlightExtension,
        DocumentExtension,
        HardBreakExtension,
        HeadingExtension,
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
        UnderlineExtension,
        ImageExtension,
        LinkExtension,
        TableExtension.extend({
          renderHTML({ node, HTMLAttributes }) {
            const { colgroup, tableWidth, tableMinWidth } = createColGroup(node, this.options.cellMinWidth);

            const table: DOMOutputSpec = [
              'div',
              { class: 'table-container' },
              [
                'table',
                mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                  style: tableWidth ? `width: ${tableWidth}` : `minWidth: ${tableMinWidth}`,
                }),
                colgroup,
                ['tbody', 0],
              ],
            ];

            return table;
          },
        }),
        TableRowExtension,
        TableHeaderExtension,
        TableCellExtension,
      ],
      content: JSON.parse(jsonString),
      editable: false,
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
    });
    if (!editor) return <CommentLoader />;
    return <EditorContent editor={editor} />;
  } catch (e) {
    console.error(e);
    return <div>Failed to Parse TipTap JSON</div>;
  }
}
