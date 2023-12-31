'use client';

import Alert from '@/components/alerts/simple';
import { Dialog, RadioGroup, Transition } from '@headlessui/react';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { Fragment, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { ActionState, createGroupAction } from './action';
import { GroupType } from '@prisma/client';

const groupTypes = [
  { name: 'blog', value: GroupType.BLOG, description: 'グループの情報を公開する用途におすすめ', descItem: [''] },
  { name: 'private', value: GroupType.PRIVATE, description: 'グループ内部での情報の整理におすすめ', descItem: [''] },
];

export function CreateGroupButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
        onClick={() => setOpen(true)}
      >
        Create Group
      </button>
      <CreateGroupModal open={open} setOpen={setOpen} />
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
      グループを作成する
    </button>
  );
}

const initialActionState: ActionState = {
  status: null,
  target: null,
  message: null,
  lastModified: 0,
};

function CreateGroupModal({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [actionState, formAction] = useFormState(createGroupAction, initialActionState);

  const cancelButtonRef = useRef(null);
  const [typeSelected, setTypeSelected] = useState(groupTypes[0]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => {}}>
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
                        <UserGroupIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-center text-gray-900">
                          Create New Group
                        </Dialog.Title>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-5">
                      <div className="">
                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                          <div className="col-span-full">
                            <label
                              htmlFor="name"
                              className="block text-sm font-noto-sans-jp font-medium leading-6 text-gray-900"
                            >
                              名前
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="name"
                                id="name"
                                autoComplete="off"
                                placeholder='グループの名称（例: "マイグループ"）'
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>
                          <div className="col-span-full">
                            <label
                              htmlFor="handle"
                              className="block text-sm font-noto-sans-jp font-medium leading-6 text-gray-900"
                            >
                              ハンドル
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="handle"
                                id="handle"
                                autoComplete="off"
                                placeholder='グループのハンドル（例: "my-group"）'
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                            <p className="text-xs text-gray-500 ml-2 mt-1">
                              ハンドルはグループページのURLの一部になります
                            </p>
                          </div>
                          <div className="col-span-full">
                            <label
                              htmlFor="about"
                              className="block text-sm font-noto-sans-jp font-medium leading-6 text-gray-900"
                            >
                              概要
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="about"
                                name="about"
                                rows={3}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                defaultValue={''}
                              />
                            </div>
                          </div>
                          <div className="col-span-full">
                            <label className="block text-sm font-noto-sans-jp font-medium leading-6 text-gray-900">
                              タイプ
                            </label>
                            <input type="hidden" name="type" value={typeSelected.value} />
                            <RadioGroup value={typeSelected} onChange={setTypeSelected}>
                              <RadioGroup.Label className="sr-only">Privacy setting</RadioGroup.Label>
                              <div className="-space-y-px rounded-md bg-white">
                                {groupTypes.map((type, typeIdx) => (
                                  <RadioGroup.Option
                                    key={type.name}
                                    value={type}
                                    className={({ checked }) =>
                                      clsx(
                                        typeIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                                        typeIdx === groupTypes.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
                                        checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
                                        'relative flex cursor-pointer border p-4 focus:outline-none'
                                      )
                                    }
                                  >
                                    {({ active, checked }) => (
                                      <>
                                        <span
                                          className={clsx(
                                            checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300',
                                            active ? 'ring-2 ring-offset-2 ring-indigo-600' : '',
                                            'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center'
                                          )}
                                          aria-hidden="true"
                                        >
                                          <span className="rounded-full bg-white w-1.5 h-1.5" />
                                        </span>
                                        <span className="ml-3 flex flex-col">
                                          <RadioGroup.Label
                                            as="span"
                                            className={clsx(
                                              checked ? 'text-indigo-900' : 'text-gray-900',
                                              'block text-sm font-medium'
                                            )}
                                          >
                                            {type.name}
                                          </RadioGroup.Label>
                                          <RadioGroup.Description
                                            as="span"
                                            className={clsx(
                                              checked ? 'text-indigo-700' : 'text-gray-500',
                                              'block text-sm'
                                            )}
                                          >
                                            {type.description}
                                          </RadioGroup.Description>
                                        </span>
                                      </>
                                    )}
                                  </RadioGroup.Option>
                                ))}
                              </div>
                            </RadioGroup>
                            <p className="mt-1 ml-2 text-xs font-noto-sans-jp text-gray-500">
                              この設定は後から変えることが出来ません。
                            </p>
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
