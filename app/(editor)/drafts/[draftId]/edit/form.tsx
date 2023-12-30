'use client';

import { uploadFiles } from '@/components/tiptap/action';
import { SITE_NAME } from '@/libs/constants';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Combobox, Menu, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
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
import AzureOpenAIExtension from '@/libs/tiptap/extensions/azure-openai';
import UploadImageExtension from '@/libs/tiptap/extensions/upload-image';
import { TextSelection } from '@tiptap/pm/state';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { MdFormatBold, MdFormatItalic, MdFormatStrikethrough, MdFormatUnderlined } from 'react-icons/md';
import { BsTextParagraph } from 'react-icons/bs';
import { PiListDashesFill, PiListNumbersFill } from 'react-icons/pi';
import { LuHeading1, LuHeading2, LuHeading3 } from 'react-icons/lu';
import { processAutoSave, processDraft, processPublish, textCompletion } from './action';

import '@/components/tiptap/tiptap.css';
import './style.css';

export interface TopicItem {
  id: string;
  handle: string;
  name: string;
}

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
      <NavBar
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

function PublishButton({ onClick }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
    >
      公開する
    </button>
  );
}

const userNavigation = [
  { name: 'プロフィール', href: '/profile' },
  { name: 'ストック', href: '/stocks' },
  { name: '下書き', href: '/drafts' },
  { name: '設定', href: '/settings' },
];

function NavBar({
  formDraftAction,
  formPublishAction,
  showAutoSavingMessage,
}: {
  formDraftAction: () => void;
  formPublishAction: () => void;
  showAutoSavingMessage: boolean;
}) {
  return (
    <div className="border-b border-inset">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="flex h-14 justify-between">
          <div className="flex flex-shrink-0 items-center">
            <Link href="/">
              <div className="flex items-center">
                <div className="pt-1">
                  <span className="text-2xl text-gray-700 font-semibold">{SITE_NAME}</span>
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <AutoSavingMessage show={showAutoSavingMessage} />
            <DraftButton onClick={formDraftAction} />
            <PublishButton onClick={formPublishAction} />
            {/* Profile dropdown */}
            <Menu as="div" className="ml-1 relative flex-shrink-0">
              <div>
                <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none hover:ring-gray-300 hover:ring-2 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span className="sr-only">Open user menu</span>
                  <img src="/api/user/icon" width={32} height={32} className="rounded-full" alt="user-icon" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-2 ring-black ring-opacity-5 focus:outline-none">
                  {userNavigation.map((item) => (
                    <Menu.Item key={item.name}>
                      {({ active }) => (
                        <Link
                          href={item.href}
                          className={clsx(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm font-semibold text-gray-600'
                          )}
                        >
                          {item.name}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
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
      <div className="flex gap-2 mb-2">
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
        {/* <div className="bg-slate-100 sticky top-0 p-2 rounded-t-md z-20">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={editor?.isActive('bold') ? 'is-active' : ''}
            >
              <MdFormatBold />
            </button>
          </div> */}
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
                <Menu as="div" className="relative text-left">
                  <div>
                    <Menu.Button
                      id="bubbleMenuButton-textMenu"
                      className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-xl font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          document.getElementById('bubbleMenuButton-bold')?.focus();
                        }
                      }}
                    >
                      {editor.isActive('paragraph') && !editor.isActive('listItem') && <BsTextParagraph />}
                      {editor.isActive('heading', { level: 1 }) && <LuHeading1 />}
                      {editor.isActive('heading', { level: 2 }) && <LuHeading2 />}
                      {editor.isActive('heading', { level: 3 }) && <LuHeading3 />}
                      {editor.isActive('bulletList') && <PiListDashesFill />}
                      {editor.isActive('orderedList') && <PiListNumbersFill />}
                      <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute left-0 z-10 mt-2 px-1 origin-top-left divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              className={clsx(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'group flex items-center px-1 my-1 py-1 rounded-md'
                              )}
                              onClick={() => {
                                if (editor.isActive('listItem')) {
                                  editor.chain().focus().liftListItem('listItem').run();
                                }
                                editor.chain().focus().setParagraph().run();
                              }}
                            >
                              <span
                                className={clsx(
                                  editor.isActive('paragraph') && !editor.isActive('listItem')
                                    ? 'bg-indigo-500/30'
                                    : 'hover:bg-gray-200',
                                  'text-xl font-semibold p-1 rounded-md'
                                )}
                              >
                                <BsTextParagraph />
                              </span>
                              <span className="ml-2 text-base whitespace-nowrap">Paragraph</span>
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                      <div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              className={clsx(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'group flex items-center px-1 my-1 py-1 rounded-md'
                              )}
                              onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
                            >
                              <span
                                className={clsx(
                                  editor.isActive('heading', { level: 1 }) ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                                  'text-xl font-semibold p-1 rounded-md'
                                )}
                              >
                                <LuHeading1 />
                              </span>
                              <span className="mx-2 text-base whitespace-nowrap">Heading 1</span>
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              className={clsx(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'group flex items-center px-1 my-1 py-1 rounded-md'
                              )}
                              onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
                            >
                              <span
                                className={clsx(
                                  editor.isActive('heading', { level: 2 }) ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                                  'text-xl font-semibold p-1 rounded-md'
                                )}
                              >
                                <LuHeading2 />
                              </span>
                              <span className="mx-2 text-base whitespace-nowrap">Heading 2</span>
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              className={clsx(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'group flex items-center px-1 my-1 py-1 rounded-md'
                              )}
                              onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
                            >
                              <span
                                className={clsx(
                                  editor.isActive('heading', { level: 3 }) ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                                  'text-xl font-semibold p-1 rounded-md'
                                )}
                              >
                                <LuHeading3 />
                              </span>
                              <span className="mx-2 text-base whitespace-nowrap">Heading 3</span>
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                      <div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              className={clsx(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'group flex items-center px-1 my-1 py-1 rounded-md'
                              )}
                              onClick={() => editor.chain().focus().toggleBulletList().run()}
                            >
                              <span
                                className={clsx(
                                  editor.isActive('bulletList') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                                  'text-xl font-semibold p-1 rounded-md'
                                )}
                              >
                                <PiListDashesFill />
                              </span>
                              <span className="mx-2 text-base whitespace-nowrap">Bullet List</span>
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              className={clsx(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'group flex items-center px-1 my-1 py-1 rounded-md'
                              )}
                              onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            >
                              <span
                                className={clsx(
                                  editor.isActive('orderedList') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                                  'text-xl font-semibold p-1 rounded-md'
                                )}
                              >
                                <PiListNumbersFill />
                              </span>
                              <span className="mx-2 text-base whitespace-nowrap">Ordered List</span>
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
                <div className="border-l-2 border-gray-400/30 ml-1 pl-1"></div>
                <button
                  id="bubbleMenuButton-bold"
                  type="button"
                  className={clsx(
                    editor.isActive('bold') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                    'px-1 group rounded-md focus:outline-1 focus:outline-gray-500'
                  )}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      document.getElementById('bubbleMenuButton-textMenu')?.focus();
                    }
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      document.getElementById('bubbleMenuButton-italic')?.focus();
                    }
                  }}
                >
                  <span className={editor.isActive('bold') ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}>
                    <MdFormatBold />
                  </span>
                </button>
                <button
                  id="bubbleMenuButton-italic"
                  type="button"
                  className={clsx(
                    editor.isActive('italic') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                    'p-1 group rounded-md focus:outline-1 focus:outline-gray-500'
                  )}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      document.getElementById('bubbleMenuButton-bold')?.focus();
                    }
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      document.getElementById('bubbleMenuButton-underline')?.focus();
                    }
                  }}
                >
                  <span className={editor.isActive('italic') ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}>
                    <MdFormatItalic />
                  </span>
                </button>
                <button
                  id="bubbleMenuButton-underline"
                  type="button"
                  className={clsx(
                    editor.isActive('underline') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                    'p-1 group rounded-md focus:outline-1 focus:outline-gray-500'
                  )}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      document.getElementById('bubbleMenuButton-italic')?.focus();
                    }
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      document.getElementById('bubbleMenuButton-strike')?.focus();
                    }
                  }}
                >
                  <span className={editor.isActive('underline') ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}>
                    <MdFormatUnderlined />
                  </span>
                </button>
                <button
                  id="bubbleMenuButton-strike"
                  type="button"
                  className={clsx(
                    editor.isActive('strike') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                    'p-1 group rounded-md focus:outline-1 focus:outline-gray-500'
                  )}
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      document.getElementById('bubbleMenuButton-underline')?.focus();
                    }
                  }}
                >
                  <span className={editor.isActive('strike') ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}>
                    <MdFormatStrikethrough />
                  </span>
                </button>
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
                <button
                  id="newLineFloatingMenuButton-paragraph"
                  type="button"
                  className={clsx(
                    editor.isActive('paragraph') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                    'p-1 group rounded-md focus:outline-1 focus:outline-gray-500'
                  )}
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      document.getElementById('newLineFloatingMenuButton-heading1')?.focus();
                    }
                  }}
                >
                  <span className={editor.isActive('paragraph') ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'}>
                    <BsTextParagraph />
                  </span>
                </button>
                <div className="border-l-2 border-gray-400/30 ml-1 pl-1"></div>
                <button
                  id="newLineFloatingMenuButton-heading1"
                  type="button"
                  className={clsx(
                    editor.isActive('heading', { level: 1 }) ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                    'px-1 group rounded-md focus:outline-1 focus:outline-gray-500'
                  )}
                  onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      document.getElementById('newLineFloatingMenuButton-paragraph')?.focus();
                    }
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      document.getElementById('newLineFloatingMenuButton-heading2')?.focus();
                    }
                  }}
                >
                  <span
                    className={
                      editor.isActive('heading', { level: 1 }) ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'
                    }
                  >
                    <LuHeading1 />
                  </span>
                </button>
                <button
                  id="newLineFloatingMenuButton-heading2"
                  type="button"
                  className={clsx(
                    editor.isActive('heading', { level: 2 }) ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                    'px-1 group rounded-md focus:outline-1 focus:outline-gray-500'
                  )}
                  onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      document.getElementById('newLineFloatingMenuButton-heading1')?.focus();
                    }
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      document.getElementById('newLineFloatingMenuButton-heading3')?.focus();
                    }
                  }}
                >
                  <span
                    className={
                      editor.isActive('heading', { level: 2 }) ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'
                    }
                  >
                    <LuHeading2 />
                  </span>
                </button>
                <button
                  id="newLineFloatingMenuButton-heading3"
                  type="button"
                  className={clsx(
                    editor.isActive('heading', { level: 3 }) ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                    'px-1 group rounded-md focus:outline-1 focus:outline-gray-500'
                  )}
                  onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      document.getElementById('newLineFloatingMenuButton-heading2')?.focus();
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      document.getElementById('newLineFloatingMenuButton-bulletList')?.focus();
                    }
                  }}
                >
                  <span
                    className={
                      editor.isActive('heading', { level: 3 }) ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'
                    }
                  >
                    <LuHeading3 />
                  </span>
                </button>
                <div className="border-l-2 border-gray-400/30 ml-2 pl-2"></div>
                <button
                  id="newLineFloatingMenuButton-bulletList"
                  type="button"
                  className={clsx(
                    editor.isActive('bulletList') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                    'px-1 group rounded-md focus:outline-1 focus:outline-gray-500'
                  )}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      document.getElementById('newLineFloatingMenuButton-heading3')?.focus();
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      document.getElementById('newLineFloatingMenuButton-orderedList')?.focus();
                    }
                  }}
                >
                  <span className={editor.isActive('bulletList') ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'}>
                    <PiListDashesFill />
                  </span>
                </button>
                <button
                  id="newLineFloatingMenuButton-orderedList"
                  type="button"
                  className={clsx(
                    editor.isActive('orderedList') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                    'px-1 group rounded-md focus:outline-1 focus:outline-gray-500'
                  )}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      document.getElementById('newLineFloatingMenuButton-bulletList')?.focus();
                    }
                  }}
                >
                  <span
                    className={editor.isActive('orderedList') ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'}
                  >
                    <PiListNumbersFill />
                  </span>
                </button>
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

function DraftButton({ onClick }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-400 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
    >
      下書きに保存
    </button>
  );
}

function AutoSavingMessage({ show }: { show: boolean }) {
  return (
    <Transition
      show={show}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-100"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <span className="px-1 text-sm font-medium text-indigo-500 animate-pulse">Auto-Saving...</span>
    </Transition>
  );
}

export function TopicInput({
  selected,
  options,
  onChange,
}: {
  selected: TopicItem[];
  options: TopicItem[];
  onChange: (values: TopicItem[]) => void;
}) {
  const [items, setItems] = useState(selected);

  return (
    <div className="border-0 rounded-md px-2 py-1.5 ring-1 ring-inset ring-gray-300 focus:ring-1 focus:ring-inset focus:ring-indigo-400 shadow-sm bg-white w-full text-sm flex gap-1.5">
      {items.map((item) => (
        <input type="hidden" name="topics" key={item.id} value={item.id} />
      ))}
      <DndContext
        // Unique id is required for avoid warning: "Prop `aria-describedby` did not match."
        // See https://github.com/clauderic/dnd-kit/issues/926
        id="dnd-context-topics-input"
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (over == null || active.id === over.id) {
            return;
          }
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          const newItems = arrayMove(items, oldIndex, newIndex);
          setItems(newItems);
          onChange(newItems);
        }}
      >
        <SortableContext items={items}>
          <div className="flex gap-1.5">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onDelete={(item) => {
                  const newItems = items.filter((i) => i.id !== item.id);
                  setItems(newItems);
                  onChange(newItems);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className={items.length >= 5 ? 'hidden' : ''}>
        <TopicsComboBox
          options={options.filter((option) => !items.some((item) => item.id === option.id))}
          onChange={(item) => {
            const newItems = [...new Set([...items, item])];
            setItems(newItems);
            onChange(newItems);
          }}
        />
      </div>
    </div>
  );
}

function SortableItem({ item, onDelete }: { item: TopicItem; onDelete: (value: TopicItem) => void }) {
  const { isDragging, setActivatorNodeRef, attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });
  return (
    <div
      ref={setNodeRef}
      className={clsx('relative', isDragging ? 'z-[1]' : '')}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="flex items-center gap-2 px-2 py-1 border-0 ring-1 ring-inset ring-gray-300 rounded-md bg-white">
        <div className="flex items-center relative gap-2">
          <span
            className="absolute inset-x-0 -top-px bottom-0"
            ref={setActivatorNodeRef}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            {...attributes}
            {...listeners}
          />
          <img src={`/api/topics/${item.id}/icon`} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" />
          <div className="flex-1">{item.handle}</div>
        </div>
        <div
          className="text-gray-500 hover:text-red-700 hover:cursor-pointer"
          onClick={() => {
            onDelete(item);
          }}
        >
          <XMarkIcon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function TopicsComboBox({ options, onChange }: { options: TopicItem[]; onChange: (value: TopicItem) => void }) {
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<TopicItem | null>(null);

  const handleChange = (topic: TopicItem) => {
    setQuery('');
    setSelectedItem(null);
    onChange(topic);
  };

  const filteredOptions =
    query === '' ? options : options.filter((option) => option.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Combobox as="div" value={selectedItem} onChange={handleChange}>
      <div className="relative">
        <Combobox.Input
          className="w-full rounded-md border-0 bg-white pt-2 pb-1 pl-3 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-1 focus:ring-inset focus:ring-indigo-600 text-sm"
          onKeyDown={(event) => {
            if (filteredOptions.length === 0 && event.key === 'Enter') {
              event.preventDefault();
            }
          }}
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(person: any) => person?.name}
          placeholder="トピック..."
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredOptions.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.map((item) => (
              <Combobox.Option
                key={item.id}
                value={item}
                className={({ active }) =>
                  clsx(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex items-center">
                      <img src={`/api/topics/${item.id}/icon`} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" />
                      <span className={clsx('ml-3 truncate', selected && 'font-semibold')}>{item.name}</span>
                    </div>

                    {selected && (
                      <span
                        className={clsx(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-indigo-600'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}
