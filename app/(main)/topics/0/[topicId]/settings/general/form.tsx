'use client';

import { CameraIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ActionState, UpdateTopicAction } from './action';

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
      Save
    </button>
  );
}

interface Topic {
  id: string;
  handle: string;
  name: string;
}

export function Form({ topic }: { topic: Topic }) {
  const [actionState, formAction] = useFormState(UpdateTopicAction, initialActionState);

  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const handleInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionState.status === 'success') {
      toast.success(actionState.message);
    } else if (actionState.status === 'error') {
      toast.error(actionState.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionState.lastModified]);

  const handleCancel = () => {
    if (iconInputRef.current) {
      iconInputRef.current.value = '';
      setIconPreview(null);
    }
    if (handleInputRef.current) {
      handleInputRef.current.value = topic.handle;
    }
    if (nameInputRef.current) {
      nameInputRef.current.value = topic.name;
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
      <input type="hidden" name="id" value={topic.id} />
      <ToastContainer />
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-3xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <label className="block text-base font-medium leading-6 text-gray-900">Images</label>
            <p className="mt-1 ml-1 text-xs text-gray-500">
              プロフィールページで利用される背景とアイコン画像を設定します。ヘッダーや他のページでの反映には時間がかかる場合があります。
            </p>

            <div className="relative mt-2 w-20 h-20">
              <img
                src={iconPreview ?? `/api/topics/${topic.id}/icon?no-cache=0`}
                className="rounded-md"
                alt="topic-icon"
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

          <div className="sm:col-span-4">
            <label htmlFor="handle" className="block text-base font-medium leading-6 text-gray-900">
              Handle
            </label>
            <div className="mt-2">
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <input
                  type="text"
                  id="name"
                  ref={handleInputRef}
                  name="handle"
                  defaultValue={topic.handle}
                  className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  autoComplete="off"
                />
              </div>
              <p className="mt-1 ml-1 text-xs text-gray-500">
                ハンドルはURLの一部になります。英字で始まり3文字以上である必要があります。利用可能は文字は英数字とハイフン(-)です。
              </p>
            </div>
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="name" className="block text-base font-medium leading-6 text-gray-900">
              Name
            </label>
            <div className="mt-2">
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <input
                  type="text"
                  id="name"
                  name="name"
                  ref={nameInputRef}
                  defaultValue={topic.name}
                  className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        <button type="button" onClick={handleCancel} className="text-sm font-semibold leading-6 text-gray-900">
          Cancel
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}
