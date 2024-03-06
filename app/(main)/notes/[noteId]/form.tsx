'use client';

import type { UserSetting } from '@/components/tiptap/editors/types';
import { Dialog, Listbox, Menu, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DocumentDuplicateIcon, EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx/lite';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { Fragment, useEffect, useState } from 'react';
import { RiPushpinFill } from 'react-icons/ri';
import { commentOnNote, deleteNote, duplicateNoteToDraft, pinNoteToGroupProfile, pinNoteToUserProfile } from './action';

const DynamicNoteViewer = dynamic(() => import('@/components/tiptap/viewers/note'), { ssr: false });
const DynamicCommentViewer = dynamic(() => import('@/components/tiptap/viewers/comment'), { ssr: false });
const DynamicCommentEditor = dynamic(() => import('@/components/tiptap/editors/comment'), { ssr: false });
const DynamicScrollToc = dynamic(() => import('@/components/tiptap/scroll-toc'), { ssr: false });

interface User {
  id: string;
}

interface Note {
  id: string;
  title: string;
  User: {
    id: string;
  };
  Group: {
    id: string;
    Members: {
      userId: string;
      role: string;
    }[];
  } | null;
  isUserPinned: boolean;
  isGroupPinned: boolean;
}

interface PostableGroup {
  id: string;
  name: string;
}

export function NoteViewer({ jsonString }: { jsonString: string }) {
  return <DynamicNoteViewer jsonString={jsonString} />;
}

export function CommentViewer({ jsonString }: { jsonString: string }) {
  return <DynamicCommentViewer jsonString={jsonString} />;
}

export function CommentEditor({
  setting,
  noteId,
  commentId,
  body,
  onSuccess,
  cancelAction,
}: {
  setting: UserSetting;
  noteId: string;
  commentId?: string;
  body?: string;
  onSuccess?: () => void;
  cancelAction?: () => void;
}) {
  return (
    <DynamicCommentEditor
      setting={setting}
      noteId={noteId}
      commentId={commentId}
      body={body}
      postAction={commentOnNote}
      onSuccess={onSuccess}
      cancelAction={cancelAction}
    />
  );
}

export function ScrollToC({ body }: { body: string }) {
  return <DynamicScrollToc>{body}</DynamicScrollToc>;
}

export function OtherMenuButton({
  userId,
  note,
  postableGroups,
  className,
}: {
  userId: string;
  note: Note;
  postableGroups: PostableGroup[];
  className?: string;
}) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDuplicateModal, setOpenDuplicateModal] = useState(false);

  const isOwner = note.User.id === userId;
  const canPinGroup = note.Group?.Members.some((m) => m.userId === userId && m.role === 'ADMIN');

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="">
          <EllipsisHorizontalIcon className={className} />
        </Menu.Button>
      </div>
      <DuplicateNoteModal
        note={note}
        postableGroups={postableGroups}
        open={openDuplicateModal}
        setOpen={setOpenDuplicateModal}
      />
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
            {isOwner && (
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
                    編集する
                  </a>
                )}
              </Menu.Item>
            )}
            {isOwner && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    className={clsx(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'w-full group flex items-center px-4 py-2 text-sm'
                    )}
                    onClick={() => pinNoteToUserProfile(note.id, !note.isUserPinned)}
                  >
                    <span className="mr-3 text-xl text-gray-400 group-hover:text-gray-500" aria-hidden="true">
                      <RiPushpinFill />
                    </span>
                    {note.isUserPinned ? 'プロフィールから外す' : 'プロフィールに固定'}
                  </button>
                )}
              </Menu.Item>
            )}
            {canPinGroup && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    className={clsx(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'w-full group flex items-center px-4 py-2 text-sm'
                    )}
                    onClick={() => pinNoteToGroupProfile(note.id, !note.isGroupPinned)}
                  >
                    <span className="mr-3 text-xl text-gray-400 group-hover:text-gray-500" aria-hidden="true">
                      <RiPushpinFill />
                    </span>
                    {note.isGroupPinned ? 'グループから外す' : 'グループに固定'}
                  </button>
                )}
              </Menu.Item>
            )}
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'w-full group flex items-center px-4 py-2 text-sm'
                  )}
                  onClick={() => setOpenDuplicateModal(true)}
                >
                  <DocumentDuplicateIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  複製する
                </button>
              )}
            </Menu.Item>
          </div>
          {isOwner && (
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
                    削除する
                  </button>
                )}
              </Menu.Item>
            </div>
          )}
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

function DuplicateNoteModal({
  note,
  postableGroups,
  open,
  setOpen,
}: {
  note: Note;
  postableGroups: PostableGroup[];
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const groups = [{ id: '', name: '全体に投稿' }, ...postableGroups];
  const [selected, setSelected] = useState(groups[0]);
  useEffect(() => {
    setSelected(groups[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
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
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <DocumentDuplicateIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="mt-2 text-base font-semibold leading-6 text-gray-900">
                      記事を複製する
                    </Dialog.Title>
                  </div>
                </div>
                <div className="mt-6 min-h-80">
                  <Listbox value={selected} onChange={setSelected} horizontal>
                    {({ open }) => (
                      <>
                        <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                          複製して投稿するグループを選択
                        </Listbox.Label>
                        <div className="relative">
                          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                            <span className="flex items-center">
                              {selected.id ? (
                                <img
                                  src={`/api/groups/${selected.id}/icon`}
                                  alt=""
                                  className="h-5 w-5 flex-shrink-0 rounded-full"
                                />
                              ) : (
                                <div className="ml-5" />
                              )}
                              <span className="ml-3 block truncate">{selected.name}</span>
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>

                          <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {groups.map((group) => (
                                <Listbox.Option
                                  key={group.id}
                                  className={({ active }) =>
                                    clsx(
                                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                      'relative cursor-default select-none py-2 pl-3 pr-9'
                                    )
                                  }
                                  value={group}
                                >
                                  {({ selected, active }) => (
                                    <>
                                      <div className="flex items-center">
                                        {group.id ? (
                                          <img
                                            src={`/api/groups/${group.id}/icon`}
                                            alt=""
                                            className="h-5 w-5 flex-shrink-0 rounded-full"
                                          />
                                        ) : (
                                          <div className="ml-5" />
                                        )}
                                        <span
                                          className={clsx(
                                            selected ? 'font-semibold' : 'font-normal',
                                            'ml-3 block truncate'
                                          )}
                                        >
                                          {group.name}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </>
                    )}
                  </Listbox>
                  <div className="mt-4">
                    <p className="text-base font-semibold text-gray-600">
                      この記事を複製して、あなたの新たな記事を作成します。
                      <br />
                      以下の内容をよく確認してから複製してください。
                    </p>
                    <ul className="mt-2 ml-8 list-disc text-black text-sm">
                      <li className="my-2">複製をすると新たな下書きとして編集画面に推移します。</li>
                      <li className="my-2">記事はすぐには公開されません。自身の操作で公開してください。</li>
                      <li className="my-2">複製された記事はあなた自身の記事になります。</li>
                      <li className="my-2">複製された記事はここで選択したグループへの投稿として扱われます。</li>
                      <li className="my-2">記事のタイトル、タグ、コンテンツが元の記事と同じ内容で複製されます。</li>
                      <li className="my-2">そのほかの、投稿日、いいね、ストック、コメントなどは複製されません。</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={async () => {
                      const draft = await duplicateNoteToDraft(note.id, selected.id).catch((e) => null);
                      if (draft) {
                        router.push(`/drafts/${draft.id}/edit`);
                      }
                    }}
                  >
                    記事を複製する
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

type Comment = {
  id: string;
  bodyBlobName: string | null;
  createdAt: Date;
  User: {
    id: string;
    uid: string;
    handle: string;
    name: string | null;
  };
};

export function CommentItemWrapper({
  children,
  userId,
  setting,
  noteId,
  comment,
  body,
  locale,
  timeZone,
}: {
  children: React.ReactNode;
  userId: string;
  setting: UserSetting;
  noteId: string;
  comment: Comment;
  body: string;
  locale: string;
  timeZone: string;
}) {
  const [showEditor, setShowEditor] = useState(false);
  return (
    <div className="pl-3 pr-4 py-4 flex gap-2">
      <div className="flex-none pt-2">
        <img src={`/api/users/${comment.User.uid}/icon`} className="w-8 h-8 rounded-full" alt="user icon" />
      </div>
      <div className="flex-1">
        <div className="border rounded-t-md bg-blue-100 px-2 py-1">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="text-sm text-gray-700 font-semibold">
                @{comment.User.handle} ({comment.User.name})
              </div>
              <div className="text-sm text-gray-600">
                commented at {new Date(comment.createdAt).toLocaleString(locale, { timeZone: timeZone })}
              </div>
            </div>
            <div className="flex-none">
              {userId === comment.User.id && (
                <div className="text-xs text-gray-500 font-semibold border border-gray-400 px-2 py-1 rounded-full">
                  Owner
                </div>
              )}
            </div>
            <div className="flex-none">
              {userId === comment.User.id && (
                <CommentOtherMenuButton
                  id={comment.id}
                  onEditClicked={(value) => {
                    setShowEditor(value);
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <div className="border border-t-0 rounded-b-md">
          {showEditor ? (
            <div className="px-2 py-2">
              <CommentEditor
                setting={setting}
                noteId={noteId}
                commentId={comment.id}
                body={body}
                onSuccess={() => {
                  setShowEditor(false);
                }}
                cancelAction={() => {
                  setShowEditor(false);
                }}
              />
            </div>
          ) : (
            <div className="px-1">
              <div id="comment-viewer" key={comment.bodyBlobName}>
                {children}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentOtherMenuButton({
  id,
  onEditClicked,
}: {
  id: string;
  onEditClicked?: (value: boolean) => void;
}) {
  return (
    <div>
      <Menu as="div" className="relative h-5">
        <Menu.Button>
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-20 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="m-1">
              <Menu.Item>
                {({ active }) => (
                  <span
                    className={clsx(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'group flex items-center px-4 py-2 text-sm hover:cursor-pointer'
                    )}
                    onClick={() => {
                      if (onEditClicked) {
                        onEditClicked(true);
                      }
                    }}
                  >
                    <PencilSquareIcon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    編集
                  </span>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <span
                    className={clsx(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'group flex items-center px-4 py-2 text-sm hover:cursor-pointer'
                    )}
                    onClick={() => {}}
                  >
                    <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                    削除
                  </span>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
