'use client';

import { Dialog, Menu, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DocumentDuplicateIcon, EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import { commentOnNote, deleteNote } from './action';

const DynamicNoteViewer = dynamic(() => import('@/components/tiptap/viewers/note'), { ssr: false });
const DynamicCommentViewer = dynamic(() => import('@/components/tiptap/viewers/comment'), { ssr: false });
const DynamicCommentEditor = dynamic(() => import('@/components/tiptap/editors/comment'), { ssr: false });
const DynamicScrollToc = dynamic(() => import('@/components/tiptap/scroll-toc'), { ssr: false });

interface Note {
  id: string;
  title: string;
}

export function NoteViewer({ jsonString }: { jsonString: string }) {
  return <DynamicNoteViewer jsonString={jsonString} />;
}

export function CommentViewer({ jsonString }: { jsonString: string }) {
  return <DynamicCommentViewer jsonString={jsonString} />;
}

export function CommentEditor({ noteId }: { noteId: string }) {
  return <DynamicCommentEditor noteId={noteId} postAction={commentOnNote} />;
}

export function ScrollToC({ body }: { body: string }) {
  return <DynamicScrollToc>{body}</DynamicScrollToc>;
}

export function OtherMenuButton({ note, className }: { note: Note; className?: string }) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="">
          <EllipsisHorizontalIcon className={className} />
        </Menu.Button>
      </div>
      <DeleteNoteModal note={note} open={openDeleteModal} setOpen={setOpenDeleteModal} />
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href={`/notes/${note.id}/edit`}
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <PencilSquareIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Edit
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <DocumentDuplicateIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Duplicate
                </a>
              )}
            </Menu.Item>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'w-full group flex items-center px-4 py-2 text-sm'
                  )}
                  onClick={() => setOpenDeleteModal(true)}
                >
                  <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  Delete
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function DeleteNoteModal({ note, open, setOpen }: { note: Note; open: boolean; setOpen: (open: boolean) => void }) {
  const router = useRouter();

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start pr-4">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="mt-2 text-base font-semibold leading-6 text-gray-900">
                      ノートの削除
                    </Dialog.Title>
                    <div className="mt-2">
                      <div className="text-sm">
                        <p className="text-gray-800 my-4">ノートを削除しようとしています。この操作は取り消せません。</p>

                        <p className="text-gray-600 my-4">この操作について、以下の点に注意してください。</p>
                        <ul className="text-gray-900 list-disc font-semibold ml-4">
                          <li className="my-1">このノートの下書きも同時に削除されます</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:bg-red-300 disabled:cursor-not-allowed"
                    onClick={async () => {
                      const res = await deleteNote(note.id)
                        .then((data) => ({ ...data, error: null }))
                        .catch((e) => ({ error: e }));
                      if (res.error) {
                        alert(res.error);
                      } else {
                        setOpen(false);
                        router.replace('/');
                      }
                    }}
                  >
                    このノートをを削除する
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}
                  >
                    キャンセル
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
