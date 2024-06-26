'use client';

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { CameraIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ActionState, DeleteGroup, UpdateGroupAction } from './action';

const initialActionState: ActionState = {
  status: null,
  target: null,
  message: null,
  lastModified: 0,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      保存
    </button>
  );
}

interface Group {
  id: string;
  handle: string;
  name: string;
  about: string;
}

export function Form({ group }: { group: Group }) {
  const [actionState, formAction] = useFormState(UpdateGroupAction, initialActionState);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const handleInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionState.status === 'success') {
      toast.success(actionState.message);
    } else if (actionState.status === 'error') {
      toast.error(actionState.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionState.lastModified]);

  const handleCancel = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
      setImagePreview(null);
    }
    if (iconInputRef.current) {
      iconInputRef.current.value = '';
      setIconPreview(null);
    }
    if (handleInputRef.current) {
      handleInputRef.current.value = group.handle;
    }
    if (nameInputRef.current) {
      nameInputRef.current.value = group.name;
    }
    if (aboutInputRef.current) {
      aboutInputRef.current.value = group.about;
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data: string = e.target?.result as string;
        if (data) {
          setImagePreview(data);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data: string = e.target?.result as string;
        if (data) {
          setIconPreview(data);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setIconPreview(null);
    }
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={group.id} />
      <ToastContainer
        stacked={true}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        closeOnClick={true}
        draggable={false}
      />
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-3xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <label className="block text-base font-medium leading-6 text-gray-900">アイコンと画像</label>
            <p className="mt-1 ml-1 text-xs text-gray-500">
              プロフィールページで利用される背景とアイコン画像を設定します。ヘッダーや他のページでの反映には時間がかかる場合があります。
            </p>

            <div className="mt-2 relative mb-[40px]">
              <div className="relative w-full pt-[15%]">
                <img
                  src={imagePreview ?? `/api/groups/${group.id}/image?no-cache=0`}
                  className="absolute top-0 w-full h-full object-cover"
                  alt="user image"
                />
                <div
                  className="absolute group top-0 left-0 w-full h-full bg-gray-50/10 hover:bg-gray-50/40 hover:cursor-pointer"
                  onClick={() => {
                    const target = imageInputRef.current;
                    if (target) {
                      (target as HTMLInputElement).click();
                    }
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] bg-slate-300/40 text-gray-700/50 group-hover:text-gray-700/80 rounded-full p-1">
                    <CameraIcon className="w-6 h-6" />
                  </div>
                  <input
                    type="file"
                    ref={imageInputRef}
                    name="image"
                    className="hidden"
                    accept="image/*"
                    multiple={false}
                    tabIndex={-1}
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="absolute top-[50%] left-[5%] w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] bg-white rounded-md p-1 pb-0">
                <img
                  src={iconPreview ?? `/api/groups/${group.id}/icon?no-cache=0`}
                  className="rounded-md"
                  alt="user-icon"
                />
                <div
                  className="absolute group top-0 left-0 w-full h-full rounded-md bg-gray-50/10 hover:bg-gray-50/40 hover:cursor-pointer"
                  onClick={() => {
                    const target = iconInputRef.current;
                    if (target) {
                      (target as HTMLInputElement).click();
                    }
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]  bg-slate-300/40 text-gray-700/50 group-hover:text-gray-700/80 rounded-full p-1">
                    <CameraIcon className="w-6 h-6" />
                  </div>
                  <input
                    type="file"
                    ref={iconInputRef}
                    name="icon"
                    className="hidden"
                    accept="image/*"
                    multiple={false}
                    tabIndex={-1}
                    onChange={handleIconChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="name" className="block text-base font-medium leading-6 text-gray-900">
              グループ名
            </label>
            <div className="mt-2">
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <input
                  type="text"
                  id="name"
                  name="name"
                  ref={nameInputRef}
                  defaultValue={group.name}
                  className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="handle" className="block text-base font-medium leading-6 text-gray-900">
              ハンドル
            </label>
            <div className="mt-2">
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <input
                  type="text"
                  id="name"
                  ref={handleInputRef}
                  name="handle"
                  defaultValue={group.handle}
                  className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  autoComplete="off"
                />
              </div>
              <p className="mt-1 ml-1 text-xs text-gray-500">
                ハンドルはURLの一部になります。英字で始まり3文字以上である必要があります。利用可能は文字は英数字とハイフン(-)です。
              </p>
            </div>
          </div>

          <div className="col-span-full">
            <label htmlFor="about" className="block text-base font-medium leading-6 text-gray-900">
              概要
            </label>
            <div className="mt-2">
              <textarea
                id="about"
                name="about"
                ref={aboutInputRef}
                defaultValue={group.about}
                rows={3}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                autoComplete="off"
              />
            </div>
            <p className="mt-1 ml-1 text-xs text-gray-500">グループの説明を記入して下さい。</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        <button type="button" onClick={handleCancel} className="text-sm font-semibold leading-6 text-gray-900">
          キャンセル
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}

export function DeleteForm({ group }: { group: Group }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (open) {
      setConfirmText('');
    }
  }, [open]);

  return (
    <div>
      <div className="flex items-center p-4 sm:p-6">
        <div className="flex-1">
          <div className="text-base font-medium leading-6 text-gray-900">グループを削除する</div>
          <p className="text-sm font-normal text-gray-500">
            グループを削除すると、グループの全てのデータが削除されます。この操作は取り消せません。
            <br />
            記事が投稿されている場合は、すべての記事を削除してからでないとグループを削除できません。
          </p>
        </div>
        <div className="flex-none">
          <button
            type="button"
            className="rounded-md bg-gray-50 ring-1 ring-gray-300 px-3 py-2 text-sm font-semibold text-red-500 shadow-sm hover:bg-red-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            onClick={() => setOpen(true)}
          >
            グループを削除する
          </button>
        </div>
      </div>
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
                <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg lg:max-w-2xl sm:p-6">
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
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <DialogTitle as="h3" className="mt-2 text-base font-semibold leading-6 text-gray-900">
                        グループ {group.name} を削除する
                      </DialogTitle>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          グループハンドル
                          <span className="text-gray-900 font-medium mx-1">{group.handle}</span>
                          を削除しようとしています。
                          グループを削除するには、ハンドル名を入力してください。この操作は取り消せません。
                        </p>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          className="mt-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-red-700 sm:text-sm sm:leading-6"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:bg-red-600/30  disabled:cursor-not-allowed"
                      disabled={confirmText !== group.handle}
                      onClick={async () => {
                        const result = await DeleteGroup(group.id, confirmText);
                        if (!result || (result && 'error' in result)) {
                          alert(result?.error || 'エラー: グループの削除に失敗しました');
                        }
                        router.push('/groups');
                      }}
                    >
                      グループを削除する
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
    </div>
  );
}
