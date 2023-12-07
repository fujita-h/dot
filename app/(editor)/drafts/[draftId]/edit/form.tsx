'use client';

import { EditorForm } from '@/components/editor/form';
import { Item as TopicItem } from '@/components/editor/topic-input';
import { uploadFiles } from '@/components/file-drop-textarea/actions';
import { SITE_NAME } from '@/libs/constants';
import { Menu, Transition } from '@headlessui/react';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plugin } from 'prosemirror-state';
import { Fragment, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { processAutoSave, processDraft, processPublish } from './action';

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
      Image.extend({
        addProseMirrorPlugins() {
          return [
            new Plugin({
              props: {
                handleDOMEvents: {
                  // Although it is possible to insert an image into a document without implementing the drop event,
                  // the source of the image becomes the URL from which it is pasted, resulting in a cross-site request.
                  // Therefore, override it to upload the image to your own site.
                  drop(view, event) {
                    // Check if the event contains files
                    const hasFiles = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length;
                    if (!hasFiles) {
                      return;
                    }

                    // Check if these files are images
                    const images = Array.from(event.dataTransfer.files).filter((file) => /image/i.test(file.type));
                    if (images.length === 0) {
                      return;
                    }

                    // Prevent default behavior
                    event.preventDefault();

                    // Get the coordinates of the drop point
                    const { schema } = view.state;
                    const coordinates = view.posAtCoords({
                      left: event.clientX,
                      top: event.clientY,
                    });

                    // If the coordinates are not inside the document, do nothing
                    if (!coordinates) {
                      return;
                    }

                    // Upload images and insert image nodes
                    Promise.all(images.map((file) => file2DataUrl(file)))
                      .then((files) => {
                        return uploadFiles(files);
                      })
                      .then((results) => {
                        results.forEach((result) => {
                          if (result.status !== 'fulfilled') return;
                          const node = schema.nodes.image.create({
                            src: `/api/blobs/${result.value.blobName}`,
                          });
                          const transaction = view.state.tr.insert(coordinates.pos, node);
                          view.dispatch(transaction);
                        });
                      });
                  },
                  paste(view, event) {
                    // Check if the event contains files
                    const hasFiles =
                      event.clipboardData && event.clipboardData.files && event.clipboardData.files.length;
                    if (!hasFiles) {
                      return;
                    }

                    // Check if these files are images
                    const images = Array.from(event.clipboardData.files).filter((file) => /image/i.test(file.type));
                    if (images.length === 0) {
                      return;
                    }

                    // Prevent default behavior
                    event.preventDefault();

                    // Get schema
                    const { schema } = view.state;

                    // Upload images and insert image nodes
                    Promise.all(images.map((file) => file2DataUrl(file)))
                      .then((files) => {
                        return uploadFiles(files);
                      })
                      .then((results) => {
                        let transaction = view.state.tr;
                        if (results.filter((result) => result.status === 'fulfilled').length > 0) {
                          transaction = transaction.deleteSelection();
                        }
                        results.forEach((result) => {
                          if (result.status !== 'fulfilled') return;
                          const node = schema.nodes.image.create({
                            src: `/api/blobs/${result.value.blobName}`,
                          });
                          transaction = transaction.insert(transaction.selection.from, node);
                        });
                        view.dispatch(transaction);
                      });
                  },
                },
              },
            }),
          ];
        },
      }),
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write something. Start here...',
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
    <form className="h-full">
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
      <div className="h-[calc(100%_-_56px)] p-2">
        <input type="hidden" name="draftId" value={draftId} />
        <input type="hidden" name="groupId" value={groupId} />
        <input type="hidden" name="relatedNoteId" value={relatedNoteId} />
        <div className="h-full">
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
      </div>
    </form>
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
    <div className="bg-white">
      <div className="mx-auto px-8">
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

/**
 * Convert File to DataUrl
 *
 * @param file File object
 * @returns Promise of { fileName: string; data: string }
 */
function file2DataUrl(file: File) {
  return new Promise<{ fileName: string; data: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ fileName: file.name, data: reader.result as string });
    };
    reader.onerror = () => {
      reject();
    };
    reader.readAsDataURL(file);
  });
}
