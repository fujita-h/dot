'use client';

import '@/components/tiptap/tiptap.css';
import { NOTE_HEADERS_CLASS_NAME } from '@/libs/constants';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import { EditorContent, mergeAttributes, useEditor } from '@tiptap/react';
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
import TableExtension from '@tiptap/extension-table';
import TableRowExtension from '@tiptap/extension-table-row';
import TableHeaderExtension from '@tiptap/extension-table-header';
import TableCellExtension from '@tiptap/extension-table-cell';
import { createColGroup } from '@/libs/tiptap/utilities/createColGroup';
import { DOMOutputSpec } from '@tiptap/pm/model';

export default function TipTapJsonNoteRenderer({ jsonString }: { jsonString: string }) {
  const editor = useEditor({
    extensions: [
      BlockquoteExtension,
      BulletListExtension,
      CodeBlockExtension,
      DocumentExtension,
      HardBreakExtension,
      HeadingExtension.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            class: {
              default: NOTE_HEADERS_CLASS_NAME,
            },
          };
        },
        renderHTML({ node, HTMLAttributes }) {
          return [
            'h' + node.attrs.level,
            {
              ...HTMLAttributes,
              id: node.textContent, // ノードのテキスト内容をid属性として設定
            },
            0,
          ];
        },
      }),
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
      UnderlineExtension,
      ImageExtension.extend({
        renderHTML({ node, HTMLAttributes }) {
          return [
            'a',
            {
              href: node.attrs.src,
              class: 'note-image-anchor',
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)],
          ];
        },
      }),
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
  });
  return <EditorContent editor={editor} />;
}
