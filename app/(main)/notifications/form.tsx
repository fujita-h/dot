'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StopIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx/lite';
import { useRouter } from 'next/navigation';
import { Fragment, useRef, useState } from 'react';
import { GoCommentDiscussion } from 'react-icons/go';
import { RiCheckboxIndeterminateLine } from 'react-icons/ri';
import { deleteNotification, markNotificationAsRead, markNotificationAsUnRead } from './action';

type Notification = {
  id: string;
  userId: string;
  status: 'UNREAD' | 'READ';
  createdAt: Date;
  updatedAt: Date;
  NotificationComment: NotificationComment | null | undefined;
};

type NotificationComment = {
  id: string;
  notificationId: string;
  commentId: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  Comment: {
    id: string;
    userId: string;
    noteId: string;
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
    User: NotificationUser;
    Note: NotificationNote;
  };
};

type NotificationUser = {
  uid: string;
  name: string | null;
};

type NotificationNote = {
  id: string;
  title: string;
};

export function NotificationsList({
  notifications,
  LOCALE,
  TIMEZONE,
}: {
  notifications: Notification[];
  LOCALE: string;
  TIMEZONE: string;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState<string[]>([]);

  const deleteConfirmationCancelButtonRef = useRef(null);
  const [openDeleteConfirmationModal, setOpenDeleteConfirmationModal] = useState(false);

  return (
    <div>
      <div className="mt-2 border border-neutral-300 rounded-md">
        <div className="bg-gray-100 border-b border-neutral-300 rounded-t-md p-2">
          <div className="flex gap-2 items-center min-h-8">
            <div className="flex-none w-5">
              {checked.length == 0 || checked.length == notifications.length ? (
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded-sm"
                  checked={checked.length === notifications.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setChecked(notifications.map((notification) => notification.id));
                    } else {
                      setChecked([]);
                    }
                  }}
                />
              ) : (
                <RiCheckboxIndeterminateLine
                  className="w-4 h-4 text-gray-600 inline-block relative top-0 left-[-1px]"
                  onClick={() => {
                    if (checked.length === notifications.length) {
                      setChecked([]);
                    } else {
                      setChecked(notifications.map((notification) => notification.id));
                    }
                  }}
                />
              )}
            </div>
            <div className="flex-1 text-sm">
              {checked.length == 0 && <span>全て選択</span>}
              {checked.length > 0 && <span>{checked.length} 件選択</span>}
              {checked.length > 0 && (
                <button
                  className="text-sm ml-2 text-gray-900 bg-gray-50 hover:bg-white border border-gray-300 rounded-md px-2 py-1"
                  onClick={async () => {
                    const res = await markNotificationAsRead(checked).catch(() => null);
                    if (res) {
                      setChecked([]);
                    }
                  }}
                >
                  既読にする
                </button>
              )}
              {checked.length > 0 && (
                <Menu as="div" className="relative inline-block">
                  <MenuButton className="text-sm ml-2 text-gray-900 bg-gray-50 hover:bg-white border border-gray-300 rounded-md px-2 py-1">
                    ...
                  </MenuButton>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuItems className="absolute right-0 mt-1 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                      <MenuItem>
                        {({ focus }) => (
                          <button
                            className={clsx(
                              'w-full flex items-center gap-2 text-left text-xs text-gray-600 px-2 py-2',
                              focus && 'bg-blue-600 text-white'
                            )}
                            onClick={async () => {
                              const res = await markNotificationAsUnRead(checked).catch(() => null);
                              if (res) {
                                setChecked([]);
                              }
                            }}
                          >
                            <StopIcon className="w-4 h-4" />
                            未読にする
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ focus }) => (
                          <button
                            className={clsx(
                              'w-full flex items-center gap-2 text-xs text-gray-600 px-2 py-2',
                              focus && 'bg-blue-600 text-white'
                            )}
                            onClick={() => {
                              setOpenDeleteConfirmationModal(true);
                            }}
                          >
                            <TrashIcon className="w-4 h-4" />
                            削除する
                          </button>
                        )}
                      </MenuItem>
                    </MenuItems>
                  </Transition>
                </Menu>
              )}
            </div>
          </div>
        </div>
        <ul role="list" className="divide-y divide-neutral-300">
          {notifications.map((notification, index, array) => (
            <li key={notification.id}>
              {notification.NotificationComment && (
                <div
                  className={clsx(
                    'flex gap-4 p-2',
                    notification.status == 'UNREAD' ? 'bg-white' : 'bg-gray-100',
                    index + 1 == array.length && 'rounded-b-md'
                  )}
                >
                  <div className="flex-none">
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded-sm"
                      checked={checked.includes(notification.id)}
                      onChange={() => {
                        if (checked.includes(notification.id)) {
                          setChecked(checked.filter((id) => id !== notification.id));
                        } else {
                          setChecked([...checked, notification.id]);
                        }
                      }}
                    />
                  </div>
                  <div
                    className="flex-1 flex mt-1 hover:cursor-pointer"
                    onClick={async () => {
                      await markNotificationAsRead([notification.id]).catch(() => null);
                      router.push(`/notes/${notification?.NotificationComment?.Comment.noteId}`);
                    }}
                  >
                    <div className="flex-1">
                      <div className="text-xs font-semibold space-x-1">
                        <GoCommentDiscussion className="w-4 h-4 inline-flex text-gray-600" />
                        <span>コメント</span>
                      </div>
                      <div className="mt-2 space-x-1 text-sm">
                        <span>{notification.NotificationComment.Comment.Note.title || 'タイトルなし'}</span>
                        <span>に</span>
                        <span>
                          {notification.NotificationComment.Comment.User.name ||
                            `@${notification.NotificationComment.Comment.id}`}
                        </span>
                        <span>さんがコメントしました。</span>
                      </div>
                    </div>
                    <div className="flex-none text-xs">
                      <span>{notification.createdAt.toLocaleString(LOCALE, { timeZone: TIMEZONE })}</span>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* ConfirmDeleteModal */}
      <Transition show={openDeleteConfirmationModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={deleteConfirmationCancelButtonRef}
          onClose={setOpenDeleteConfirmationModal}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        通知の削除
                      </DialogTitle>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          選択された通知を削除しようとしています。この操作は取り消せません。
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                      onClick={async () => {
                        const res = await deleteNotification(checked).catch(() => null);
                        if (res) {
                          setChecked([]);
                        }
                        setOpenDeleteConfirmationModal(false);
                      }}
                    >
                      選択された通知を削除する
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpenDeleteConfirmationModal(false)}
                      ref={deleteConfirmationCancelButtonRef}
                    >
                      キャンセル
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
