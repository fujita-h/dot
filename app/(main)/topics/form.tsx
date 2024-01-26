'use client';

import Alert from '@/components/alerts/simple';
import { Dialog, Transition } from '@headlessui/react';
import { TagIcon } from '@heroicons/react/24/outline';
import { Fragment, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { ActionState, addTopicAction } from './action';

export function AddTopicButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
        onClick={() => setOpen(true)}
      >
        新しいトピックを作成する
      </button>
      <AddTopicModal open={open} setOpen={setOpen} />
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
    >
      トピックを作成する
    </button>
  );
}

const initialActionState: ActionState = {
  status: null,
  target: null,
  message: null,
  lastModified: 0,
};

export function AddTopicModal({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [actionState, formAction] = useFormState(addTopicAction, initialActionState);

  const cancelButtonRef = useRef(null);

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
                <form action={formAction}>
                  <div>
                    <div className="flex justify-center items-center gap-3">
                      <div className="flex-0 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <TagIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-center text-gray-900">
                          新しいトピックを作成する
                        </Dialog.Title>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-5">
                      <div className="">
                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                          <div className="col-span-full">
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                              名前
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="name"
                                id="name"
                                autoComplete="off"
                                placeholder='トピックの名称（例: "マイトピック"）'
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>
                          <div className="col-span-full">
                            <label htmlFor="handle" className="block text-sm font-medium leading-6 text-gray-900">
                              ハンドル
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="handle"
                                id="handle"
                                autoComplete="off"
                                placeholder='トピックのハンドル（例: "my-topic"）'
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                            <p className="text-xs text-gray-500 ml-2 mt-1">ハンドルはトピックのURLの一部になります</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {actionState.status === 'error' && (
                    <div className="mt-2">
                      <Alert type="error" title="エラーが発生しました">
                        {actionState.message}
                      </Alert>
                    </div>
                  )}
                  <div className="mt-8 sm:mt-12 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <SubmitButton />
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
