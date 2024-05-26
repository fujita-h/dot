'use client';

import { DraftLoader } from '@/components/loaders';
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
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon, TrashIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx/lite';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import { deleteDraft } from './action';

const DynamicDraftViewer = dynamic(() => import('@/components/tiptap/viewers/draft'), {
  ssr: false,
  loading: () => <DraftLoader />,
});

export function DraftViewer({ jsonString }: { jsonString: string }) {
  return <DynamicDraftViewer jsonString={jsonString} />;
}

export function OtherMenuButton({ id, page }: { id: string; page: number }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  return (
    <div>
      <Menu as="div" className="relative h-5">
        <MenuButton>
          <EllipsisHorizontalIcon className="mx-2 h-6 w-6" />
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
          <MenuItems className="absolute right-0 mt-2 z-10 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="m-1">
              <MenuItem>
                {({ focus }) => (
                  <span
                    className={clsx(
                      focus ? 'bg-red-600 text-white' : 'text-gray-700',
                      'group flex items-center px-4 py-3 text-sm hover:cursor-pointer'
                    )}
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" aria-hidden="true" />
                    削除
                  </span>
                )}
              </MenuItem>
            </div>
          </MenuItems>
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
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
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
                      下書きの削除
                    </DialogTitle>
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
                    data-autofocus
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
  );
}
