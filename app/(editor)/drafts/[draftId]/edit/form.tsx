'use client';

import { EditorNavbar } from '@/components/navbar';
import { TopicInput, TopicItem } from '@/components/topics/input';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { processAutoSave, processDraft, processPublish, textCompletion } from './action';
import type { Group, UserSetting } from './types';

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
import AzureOpenAIExtension from '@/libs/tiptap/extensions/azure-openai';
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
import { Editor, EditorContent, useEditor } from '@tiptap/react';

import '@/components/tiptap/tiptap.css';
import 'highlight.js/styles/github.css';
import './style.css';

export function Form({
  setting,
  draftId,
  group,
  relatedNoteId,
  title,
  body,
  topics,
  topicOptions,
}: {
  setting: UserSetting;
  draftId: string;
  group: Group | null;
  relatedNoteId: string | undefined;
  title: string;
  body: string;
  topics: TopicItem[];
  topicOptions: TopicItem[];
}) {
  const groupId = group?.id || undefined;
  const router = useRouter();
  const [titleState, setTitleState] = useState(title);
  const [topicsState, setTopicsState] = useState(topics);
  const [autoSaveTimestamp, setAutoSaveTimestamp] = useState(0);
  const [showAutoSavingMessage, setShowAutoSavingMessage] = useState(false);

  let content: any = undefined;
  try {
    content = JSON.parse(body);
  } catch (e) {
    content = body || '';
  }

  const editor = useEditor({
    extensions: [
      AzureOpenAIExtension.configure({
        tabCompletion: true,
        completionFunc: textCompletion,
      }),
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
        placeholder: 'Start writing here...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setAutoSaveTimestamp(Date.now());
    },
  });

  useEffect(() => {
    if (autoSaveTimestamp === 0) {
      return;
    }
    const timer = setTimeout(() => {
      setShowAutoSavingMessage(true);
      processAutoSave(draftId, groupId, relatedNoteId, undefined, undefined, JSON.stringify(editor?.getJSON()));
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveTimestamp]);

  useEffect(() => {
    if (!showAutoSavingMessage) return;
    const timer = setTimeout(() => {
      setShowAutoSavingMessage(false);
    }, 2800);
    return () => {
      clearTimeout(timer);
    };
  }, [showAutoSavingMessage]);

  return (
    <form>
      <EditorNavbar
        group={group}
        formDraftAction={async () => {
          setAutoSaveTimestamp(0);
          const result = await processDraft(
            draftId,
            groupId,
            relatedNoteId,
            titleState,
            topicsState.map((t) => t.id),
            JSON.stringify(editor?.getJSON())
          ).catch((e) => null);
          if (!result || (result && 'error' in result)) {
            alert(result?.error || 'Failed to save draft');
            return;
          }
          router.replace(`/drafts/?id=${result.id}`);
        }}
        formPublishAction={async () => {
          setAutoSaveTimestamp(0);
          const result = await processPublish(
            draftId,
            groupId,
            relatedNoteId,
            titleState,
            topicsState.map((t) => t.id),
            JSON.stringify(editor?.getJSON())
          ).catch((e) => null);
          if (!result || (result && 'error' in result)) {
            alert(result?.error || 'Failed to publish note');
            return;
          }
          router.replace(`/notes/${result.id}`);
        }}
        showAutoSavingMessage={showAutoSavingMessage}
      />
      <div className="max-w-screen-2xl mx-auto p-2">
        <input type="hidden" name="draftId" value={draftId} />
        <input type="hidden" name="groupId" value={groupId} />
        <input type="hidden" name="relatedNoteId" value={relatedNoteId} />
        <EditorForm
          setting={setting}
          title={titleState}
          topics={topicsState}
          topicOptions={topicOptions}
          editor={editor}
          onTitleChange={async (title) => {
            setTitleState(title);
            await processAutoSave(draftId, groupId, relatedNoteId, title, undefined, undefined);
          }}
          onTopicsChange={async (topics) => {
            setTopicsState(topics);
            await processAutoSave(
              draftId,
              groupId,
              relatedNoteId,
              undefined,
              topics.map((t) => t.id),
              undefined
            );
          }}
        />
      </div>
    </form>
  );
}

function EditorForm({
  setting,
  title,
  topics,
  topicOptions,
  editor,
  onTitleChange,
  onTopicsChange,
}: {
  setting: UserSetting;
  title: string;
  topics: TopicItem[];
  topicOptions: TopicItem[];
  editor: Editor | null;
  onTitleChange?: (title: string) => void;
  onTopicsChange?: (topics: TopicItem[]) => void;
}) {
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
      const focusableElements = Array.from(document.querySelectorAll('#draft-editor button')).filter(
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
  }, [editor, editorRef]);
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <div className="flex-1 h-[44px]">
          <input
            type="text"
            name="title"
            className="block w-full h-full rounded-md border-0 py-1.5 text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-400 sm:leading-6"
            placeholder="Title"
            autoComplete="off"
            defaultValue={title}
            onChange={(e) => {
              onTitleChange && onTitleChange(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="relative flex gap-2 z-20">
        <div className="flex-1 h-[44px]">
          <TopicInput
            selected={topics}
            options={topicOptions}
            onChange={(e) => {
              onTopicsChange && onTopicsChange(e);
            }}
          />
        </div>
      </div>
      <div className=" bg-white rounded-md ring-1 ring-inset ring-gray-300">
        {!editor && (
          <div className="mt-2 px-2 py-16">
            <div className="text-center text-2xl text-gray-400">Loading...</div>
          </div>
        )}
        {editor && (
          <>
            <div className="bg-gray-100 sticky top-0 left-0 z-10 pt-2">
              <StickyMenu editor={editor} />
            </div>
            <div className="px-2 pb-1">
              <BubbleMenuImage editor={editor} />
              <BubbleMenuLink editor={editor} />
              <BubbleMenuTable editor={editor} />
              <BubbleMenuTextSelected editor={editor} />
              {setting.editorShowNewLineFloatingMenu && <FloatingMenuNewLine editor={editor} />}
              <div id="draft-editor" ref={editorRef}>
                <EditorContent editor={editor} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
