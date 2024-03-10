'use client';

import { Menu, Dialog, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon, TrashIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx/lite';
import { Fragment, useRef, useState } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { deleteDraft } from './action';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const DynamicDraftViewer = dynamic(() => import('@/components/tiptap/viewers/draft'), { ssr: false });

export function DraftViewer({ jsonString }: { jsonString: string }) {
  return <DynamicDraftViewer jsonString={jsonString} />;
}

export function OtherMenuButton({ id, page }: { id: string; page: number }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  return (
    <div>
      <Menu as="div" className="relative h-5">
        <Menu.Button>
          <EllipsisHorizontalIcon className="mx-2 h-6 w-6" />
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
          <Menu.Items className="absolute right-0 mt-2 z-10 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="m-1">
              <Menu.Item>
                {({ active }) => (
                  <span
                    className={clsx(
                      active ? 'bg-red-600 text-white' : 'text-gray-700',
                      'group flex items-center px-4 py-3 text-sm hover:cursor-pointer'
                    )}
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" aria-hidden="true" />
                    削除
                  </span>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <ConfirmDeleteModal id={id} page={page} open={deleteModalOpen} setOpen={setDeleteModalOpen} />
    </div>
  );
}

function ConfirmDeleteModal({
  id,
  page,
  open,
  setOpen,
}: {
  id: string;
  page: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const cancelButtonRef = useRef(null);
  const handleDelete = async () => {
    const result = await deleteDraft(id);
    if (!result || (result && 'error' in result)) {
      alert(result?.error || '削除に失敗しました');
      return;
    }
    if (result && result.id) {
      router.push(`/drafts?page=${page}`);
    }
  };
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      下書きの削除
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        下書きを削除しようとしています。削除するとこの下書きのデータが失われます。この操作は取り消せません。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={handleDelete}
                  >
                    下書きを削除する
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
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
