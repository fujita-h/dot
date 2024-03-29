'use client';

import { updateUserAction, ActionState } from './action';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

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

interface Props {
  handle: string;
  name: string | null;
  about: string | null;
}

export function Form({ props }: { props: Props }) {
  const [actionState, formAction] = useFormState(updateUserAction, initialActionState);

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
      handleInputRef.current.value = props.handle;
    }
    if (nameInputRef.current) {
      nameInputRef.current.value = props.name || '';
    }
    if (aboutInputRef.current) {
      aboutInputRef.current.value = props.about || '';
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
                  src={imagePreview ?? '/api/user/image?no-cache=0'}
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

              <div className="absolute top-[50%] left-[5%] w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] bg-white rounded-full p-1 pb-0">
                <img src={iconPreview ?? '/api/user/icon?no-cache=0'} className="rounded-full" alt="user-icon" />
                <div
                  className="absolute group top-0 left-0 w-full h-full rounded-full bg-gray-50/10 hover:bg-gray-50/40 hover:cursor-pointer"
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
              名前
            </label>
            <div className="mt-2">
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <input
                  type="text"
                  id="name"
                  name="name"
                  ref={nameInputRef}
                  defaultValue={props.name || ''}
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
                  defaultValue={props.handle}
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
              自己紹介
            </label>
            <div className="mt-2">
              <textarea
                id="about"
                name="about"
                ref={aboutInputRef}
                defaultValue={props.about || ''}
                rows={5}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                autoComplete="off"
              />
            </div>
            <p className="mt-1 ml-1 text-xs text-gray-500">
              自己紹介を記入できます。内容はユーザーページで表示されます。
              <br />
              表示領域には上限があるため、長文の場合は表示が省略されることがあります。
            </p>
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
