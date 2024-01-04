'use client';

import { uploadFiles } from '@/components/tiptap/action';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import { BubbleMenu, Editor, EditorContent, FloatingMenu, useEditor } from '@tiptap/react';
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
import AzureOpenAIExtension from '@/libs/tiptap/extensions/azure-openai';
import UploadImageExtension from '@/libs/tiptap/extensions/upload-image';
import { TextSelection } from '@tiptap/pm/state';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { processAutoSave, processDraft, processPublish, textCompletion } from './action';
import {
  ButtonBold,
  ButtonBulletList,
  ButtonCode,
  ButtonHeading1,
  ButtonHeading2,
  ButtonHeading3,
  ButtonItalic,
  ButtonOrderedList,
  ButtonParagraph,
  ButtonSelectText,
  ButtonStrike,
  ButtonTable,
  ButtonUnderline,
} from '@/components/tiptap/buttons';
import { EditorNavbar } from '@/components/navbar';
import { TopicItem, TopicInput } from '@/components/topics/input';

import '@/components/tiptap/tiptap.css';
import './style.css';

export function Form({
  draftId,
  groupId,
  relatedNoteId,
  title,
  body,
  topics,
  topicOptions,
}: {
  draftId: string;
  groupId: string | undefined;
  relatedNoteId: string | undefined;
  title: string;
  body: string;
  topics: TopicItem[];
  topicOptions: TopicItem[];
}) {
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
      TableExtension.configure({
        resizable: true,
      }),
      TableRowExtension,
      TableHeaderExtension,
      TableCellExtension,
      ImageExtension,
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
          if (result) {
            router.replace(`/drafts/?id=${result.id}`);
          }
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
          if (result) {
            router.replace(`/notes/${result.id}`);
          }
        }}
        showAutoSavingMessage={showAutoSavingMessage}
      />
      <div className="max-w-screen-2xl mx-auto p-2">
        <input type="hidden" name="draftId" value={draftId} />
        <input type="hidden" name="groupId" value={groupId} />
        <input type="hidden" name="relatedNoteId" value={relatedNoteId} />
        <EditorForm
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
  title,
  topics,
  topicOptions,
  editor,
  onTitleChange,
  onTopicsChange,
}: {
  title: string;
  topics: TopicItem[];
  topicOptions: TopicItem[];
  editor: Editor | null;
  onTitleChange?: (title: string) => void;
  onTopicsChange?: (topics: TopicItem[]) => void;
}) {
  useEffect(() => {
    // Tab key handling. Prevent tab key from moving focus to outside of the editor.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        return;
      }

      // Collect focusable elements
      const focusableElements = document.querySelectorAll('#draft-editor button');

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
    document.addEventListener('keydown', handleKeyDown);

    // Remove event listener when component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
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
        {editor && (
          <div className="bg-gray-100 sticky top-0 left-0 z-10 pt-2">
            <div className="bg-white p-2 border rounded-t-md border-gray-300">
              <div className="flex text-2xl">
                <ButtonSelectText
                  editor={editor}
                  id="button-textMenu"
                  prevButtonId={undefined}
                  nextButtonId="button-bold"
                />
                <div className="border-l-2 border-gray-400/30 ml-2 pl-1"></div>
                <ButtonBold
                  editor={editor}
                  id="button-bold"
                  prevButtonId="button-textMenu"
                  nextButtonId="button-italic"
                />
                <ButtonItalic
                  editor={editor}
                  id="button-italic"
                  prevButtonId="button-bold"
                  nextButtonId="button-underline"
                />
                <ButtonUnderline
                  editor={editor}
                  id="button-underline"
                  prevButtonId="button-italic"
                  nextButtonId="button-strike"
                />
                <ButtonStrike
                  editor={editor}
                  id="button-strike"
                  prevButtonId="button-underline"
                  nextButtonId="utton-code"
                />
                <ButtonCode editor={editor} id="button-code" prevButtonId="button-strike" nextButtonId={undefined} />
              </div>
            </div>
          </div>
        )}

        <div className="px-2 pb-1">
          {editor && (
            <BubbleMenu
              tippyOptions={{ duration: 200, placement: 'top-start', maxWidth: 'none' }}
              editor={editor}
              shouldShow={({ editor, view, state, oldState, from, to }) => {
                // original shouldShow function
                const { doc, selection } = state;
                const { empty } = selection;
                const isEmptyTextBlock = !doc.textBetween(from, to).length && state.selection instanceof TextSelection;
                const hasEditorFocus = view.hasFocus();
                if (!hasEditorFocus || empty || isEmptyTextBlock || !editor.isEditable) {
                  return false;
                }
                // custom shouldShow function
                if (editor.isActive('image')) return false;
                return true;
              }}
            >
              <div className="flex rounded-md text-2xl bg-white text-black px-2 py-1 ml-2 shadow-md shadow-gray-300 ring-inset ring-1 ring-gray-300">
                <ButtonSelectText editor={editor} id="bm-textMenu" prevButtonId={undefined} nextButtonId="bm-bold" />
                <div className="border-l-2 border-gray-400/30 ml-1 pl-1"></div>
                <ButtonBold editor={editor} id="bm-bold" prevButtonId="bm-textMenu" nextButtonId="bm-italic" />
                <ButtonItalic editor={editor} id="bm-italic" prevButtonId="bm-bold" nextButtonId="bm-underline" />
                <ButtonUnderline editor={editor} id="bm-underline" prevButtonId="bm-italic" nextButtonId="bm-strike" />
                <ButtonStrike editor={editor} id="bm-strike" prevButtonId="bm-underline" nextButtonId="bm-code" />
                <ButtonCode editor={editor} id="bm-code" prevButtonId="bm-strike" nextButtonId={undefined} />
              </div>
            </BubbleMenu>
          )}
          {editor && (
            <FloatingMenu
              pluginKey="newLineFloatingMenu"
              tippyOptions={{ duration: 200 }}
              editor={editor}
              shouldShow={({ editor, view, state, oldState }) => {
                const { selection } = state;
                const { $anchor, empty } = selection;
                const isRootDepth = $anchor.depth === 1;
                const isEmptyTextBlock =
                  $anchor.parent.isTextblock && !$anchor.parent.type.spec.code && !$anchor.parent.textContent;
                if (!view.hasFocus() || !empty || !isRootDepth || !isEmptyTextBlock || !editor?.isEditable) {
                  return false;
                }
                return true;
              }}
            >
              <div className="flex rounded-md text-2xl bg-white text-black px-2 py-1 ml-2 shadow-md shadow-gray-300 ring-inset ring-1 ring-gray-300">
                <ButtonParagraph
                  editor={editor}
                  id="fm-paragraph"
                  prevButtonId={undefined}
                  nextButtonId="fm-heading1"
                />
                <div className="border-l-2 border-gray-400/30 ml-1 pl-1"></div>
                <ButtonHeading1
                  editor={editor}
                  id="fm-heading1"
                  prevButtonId="fm-paragraph"
                  nextButtonId="fm-heading2"
                />
                <ButtonHeading2
                  editor={editor}
                  id="fm-heading2"
                  prevButtonId="fm-heading1"
                  nextButtonId="fm-heading3"
                />
                <ButtonHeading3
                  editor={editor}
                  id="fm-heading3"
                  prevButtonId="fm-heading2"
                  nextButtonId="fm-bulletList"
                />
                <div className="border-l-2 border-gray-400/30 ml-2 pl-2"></div>
                <ButtonBulletList
                  editor={editor}
                  id="fm-bulletList"
                  prevButtonId="fm-heading3"
                  nextButtonId="fm-orderedList"
                />
                <ButtonOrderedList
                  editor={editor}
                  id="fm-orderedList"
                  prevButtonId="fm-bulletList"
                  nextButtonId="fm-table"
                />
                <div className="border-l-2 border-gray-400/30 ml-2 pl-2"></div>
                <ButtonTable editor={editor} id="fm-table" prevButtonId="fm-orderedList" nextButtonId={undefined} />
              </div>
            </FloatingMenu>
          )}
          <div id="draft-editor">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
