'use client';

import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
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

import '@/components/tiptap/tiptap.css';

export default function TipTapJsonDraftRenderer({ jsonString }: { jsonString: string }) {
  const editor = useEditor({
    extensions: [
      BlockquoteExtension,
      BulletListExtension,
      CodeBlockExtension,
      DocumentExtension,
      HardBreakExtension,
      HeadingExtension,
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
      ImageExtension,
      LinkExtension.configure({
        openOnClick: false,
      }),
    ],
    editable: false,
  });

  if (!editor) return <></>;

  editor.commands.setContent(JSON.parse(jsonString));

  return <EditorContent editor={editor} />;
}