'use client';

import { Combobox, Dialog, RadioGroup, Transition } from '@headlessui/react';
import { ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ArrowPathIcon, ExclamationTriangleIcon, UsersIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx/lite';
import { Fragment, useEffect, useState } from 'react';
import { addMemberToGroup, removeMemberFromGroup, updateMemberRole } from './action';

interface Group {
  id: string;
  handle: string;
  name: string;
  Members: {
    userId: string;
    role: string;
  }[];
}

interface User {
  id: string;
  uid: string;
  handle: string;
  name: string | null;
  email: string | null;
}

interface Role {
  name: string;
  value: 'ADMIN' | 'CONTRIBUTOR' | 'READER';
  description: string;
}

const roles: Role[] = [
  { name: 'グループ管理者', value: 'ADMIN', description: 'グループおよびメンバーの設定を変更できます。' },
  { name: '投稿者', value: 'CONTRIBUTOR', description: 'ノートを投稿できます。' },
  { name: '閲覧のみ', value: 'READER', description: 'ノートを閲覧できます。投稿することはできません。' },
];

export function Form({ group, users }: { group: Group; users: User[] }) {
  const [addUser, setAddUser] = useState<User[] | null>(null);
  const [editUser, setEditUser] = useState<(User & { role: string }) | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const members: (User & { role: string })[] = group.Members.map((member) => {
    const user = users.find((user) => user.id === member.userId);
    if (!user) return null;
    return { ...user, role: member.role };
  }).filter((member) => member !== null) as (User & { role: string })[];

  return (
    <div className="p-4">
      <div className="px-4">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold leading-6 text-gray-900">Members</h1>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                setAddUser(users.filter((user) => !members.find((member) => member.id === user.id)));
              }}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              メンバーを追加
            </button>
          </div>
        </div>
        <div className="mt-4 flow-root px-4">
          <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-3 pr-4 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, idx) => (
                    <tr key={member.id}>
                      <td
                        className={clsx(
                          idx !== members.length - 1 ? 'border-b border-gray-200' : '',
                          'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            className="inline-flex w-8 h-8 rounded-full"
                            src={`/api/users/${member.uid}/icon`}
                            alt="user icon"
                          />
                          <div>
                            <div className="text-gray-500 text-xs">@{member.handle}</div>
                            <div className="text-sm">{member.name || 'No Name'}</div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={clsx(
                          idx !== members.length - 1 ? 'border-b border-gray-200' : '',
                          'whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell'
                        )}
                      >
                        {member.email || 'No Email'}
                      </td>
                      <td
                        className={clsx(
                          idx !== members.length - 1 ? 'border-b border-gray-200' : '',
                          'whitespace-nowrap px-3 py-4 text-sm text-gray-700'
                        )}
                      >
                        {roles.find((role) => role.value === member.role)?.name}
                      </td>
                      <td
                        className={clsx(
                          idx !== members.length - 1 ? 'border-b border-gray-200' : '',
                          'relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8'
                        )}
                      >
                        <div className="space-x-4">
                          <span
                            className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline hover:cursor-pointer"
                            onClick={() => {
                              setEditUser(member);
                            }}
                          >
                            変更<span className="sr-only">, {member.name}</span>
                          </span>
                          <span
                            className="font-semibold text-red-600 hover:text-red-800 hover:underline hover:cursor-pointer"
                            onClick={() => {
                              setDeleteUser(member);
                            }}
                          >
                            削除<span className="sr-only">, {member.name}</span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <AddUserModal group={group} users={addUser} />
      <EditUserModal group={group} user={editUser} />
      <DeleteUserModal group={group} user={deleteUser} />
    </div>
  );
}

function AddUserModal({ group, users }: { group: Group; users: User[] | null }) {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState('');
  const [userSelected, setUserSelected] = useState<User | null>(null);
  const [selected, setSelected] = useState<Role | null>(null);

  useEffect(() => {
    if (users) {
      setOpen(true);
      setQuery('');
      setUserSelected(null);
    }
  }, [users]);

  const filteredUser =
    query === ''
      ? []
      : users?.filter((person) => person.name && person.name.toLowerCase().includes(query.toLowerCase())) || [];

  return (
    <Transition.Root show={open} as={Fragment} afterLeave={() => setQuery('')} appear>
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-3xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <div className="px-6 py-4">
                <div className="text-xl font-semibold">メンバーの追加</div>
              </div>
              <Combobox value={userSelected} onChange={setUserSelected}>
                {({ activeOption }) => {
                  const activeUser = (activeOption as User) || userSelected || null;
                  return (
                    <>
                      <div className="relative">
                        <MagnifyingGlassIcon
                          className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        <Combobox.Input
                          className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                          placeholder="Search..."
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                        />
                      </div>

                      {(query === '' || filteredUser.length > 0) && (
                        <Combobox.Options as="div" static hold className="flex transform-gpu divide-x divide-gray-100">
                          <div
                            className={clsx(
                              'max-h-[450px] min-w-0 flex-auto scroll-py-4 overflow-y-auto px-6 py-4',
                              activeUser && 'sm:h-[450px]'
                            )}
                          >
                            {query === '' && (
                              <h2 className="mb-4 mt-2 text-xs font-semibold text-gray-500">All users</h2>
                            )}
                            <div className="-mx-2 text-sm text-gray-700">
                              {(query === '' ? users || [] : filteredUser).map((person) => (
                                <Combobox.Option
                                  as="div"
                                  onClick={() => {}}
                                  key={person.id}
                                  value={person}
                                  className={({ active }) =>
                                    clsx(
                                      'flex cursor-default select-none items-center rounded-md p-2',
                                      active && 'bg-gray-100 text-gray-900'
                                    )
                                  }
                                >
                                  {({ active }) => (
                                    <>
                                      <img
                                        src={`/api/users/${person.uid}/icon`}
                                        alt=""
                                        className="h-6 w-6 flex-none rounded-full"
                                      />
                                      <span className="ml-3 flex-auto truncate">{person.name}</span>
                                      {active && (
                                        <ChevronRightIcon
                                          className="ml-3 h-5 w-5 flex-none text-gray-400"
                                          aria-hidden="true"
                                        />
                                      )}
                                    </>
                                  )}
                                </Combobox.Option>
                              ))}
                            </div>
                          </div>

                          {activeUser ? (
                            <div className="hidden h-[450px] w-2/3 flex-none flex-col divide-y divide-gray-100 overflow-y-auto sm:flex">
                              <div className="flex items-center gap-6 py-3 px-6">
                                <div className="flex-none">
                                  <img
                                    src={`/api/users/${activeUser.uid}/icon`}
                                    alt=""
                                    className="mx-auto h-16 w-16 rounded-full"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm leading-4 text-gray-500">@{activeUser.handle}</p>
                                  <p className="font-semibold text-gray-900">{activeUser.name || 'No Name'}</p>
                                  <p className="text-sm leading-4 text-gray-500">{activeUser.email || 'No Email'}</p>
                                </div>
                              </div>
                              <div className="flex flex-auto flex-col justify-between p-4">
                                <div className="text-lg font-semibold">Role</div>
                                <RadioGroup value={selected} onChange={setSelected}>
                                  <RadioGroup.Label className="sr-only">Privacy setting</RadioGroup.Label>
                                  <div className="-space-y-px rounded-md bg-white">
                                    {roles.map((setting, settingIdx) => (
                                      <RadioGroup.Option
                                        key={setting.name}
                                        value={setting}
                                        className={({ checked }) =>
                                          clsx(
                                            settingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                                            settingIdx === roles.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
                                            checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
                                            'relative flex cursor-pointer border p-4 focus:outline-none'
                                          )
                                        }
                                      >
                                        {({ active, checked }) => (
                                          <>
                                            <span
                                              className={clsx(
                                                checked
                                                  ? 'bg-indigo-600 border-transparent'
                                                  : 'bg-white border-gray-300',
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
                                                {setting.name}
                                              </RadioGroup.Label>
                                              <RadioGroup.Description
                                                as="span"
                                                className={clsx(
                                                  checked ? 'text-indigo-700' : 'text-gray-500',
                                                  'block text-sm'
                                                )}
                                              >
                                                {setting.description}
                                              </RadioGroup.Description>
                                            </span>
                                          </>
                                        )}
                                      </RadioGroup.Option>
                                    ))}
                                  </div>
                                </RadioGroup>
                                <button
                                  type="button"
                                  className="mt-6 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                  onClick={async () => {
                                    const res = await addMemberToGroup(
                                      group.id,
                                      activeUser.id,
                                      selected?.value || 'READER'
                                    ).catch((e) => null);
                                    if (!res || (res && 'error' in res)) {
                                      alert(res?.error || 'エラーが発生しました');
                                      return;
                                    }
                                    setOpen(false);
                                  }}
                                >
                                  メンバーに追加
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="hidden h-[450px] w-2/3 flex-none flex-col divide-y divide-gray-100 overflow-y-auto sm:flex">
                              <div className="flex-none p-6 text-center">
                                <UsersIcon className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
                                <h2 className="mt-3 font-semibold text-gray-900">Select User</h2>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                  ユーザーを検索し、追加するユーザーを選択してください。
                                </p>
                              </div>
                            </div>
                          )}
                        </Combobox.Options>
                      )}

                      {query !== '' && filteredUser.length === 0 && (
                        <div className="px-6 py-14 text-center text-sm sm:px-14">
                          <UsersIcon className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
                          <p className="mt-4 font-semibold text-gray-900">No people found</p>
                          <p className="mt-2 text-gray-500">
                            We couldn’t find anything with that term. Please try again.
                          </p>
                        </div>
                      )}
                    </>
                  );
                }}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function EditUserModal({ group, user }: { group: Group; user: (User & { role: string }) | null }) {
  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Role | null>(null);
  useEffect(() => {
    if (user) {
      setOpen(true);
      setSelected(roles.find((role) => role.value === user.role) || null);
    }
  }, [user]);

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
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ArrowPathIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="mt-2 text-base font-semibold leading-6 text-gray-900">
                      メンバーの設定変更
                    </Dialog.Title>
                    <div className="mt-2">
                      <div className="text-sm">
                        <p className="text-gray-800 my-4">以下のメンバーの設定を変更しようとしています。</p>
                        <div className="mt-4 mx-2 flex items-center gap-3 shadow-sm shadow-gray-300 rounded-md border border-gray-300 p-2">
                          <img
                            className="inline-flex w-8 h-8 rounded-full"
                            src={`/api/users/${user?.uid}/icon`}
                            alt="user icon"
                          />
                          <div>
                            <div className="text-gray-500 text-xs">@{user?.handle}</div>
                            <div className="text-sm">{user?.name}</div>
                          </div>
                        </div>
                        <p className="text-gray-900 my-4 text-base font-semibold">ロールの変更</p>

                        <RadioGroup value={selected} onChange={setSelected}>
                          <RadioGroup.Label className="sr-only">Privacy setting</RadioGroup.Label>
                          <div className="-space-y-px rounded-md bg-white">
                            {roles.map((setting, settingIdx) => (
                              <RadioGroup.Option
                                key={setting.name}
                                value={setting}
                                className={({ checked }) =>
                                  clsx(
                                    settingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                                    settingIdx === roles.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
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
                                        {setting.name}
                                      </RadioGroup.Label>
                                      <RadioGroup.Description
                                        as="span"
                                        className={clsx(checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm')}
                                      >
                                        {setting.description}
                                      </RadioGroup.Description>
                                    </span>
                                  </>
                                )}
                              </RadioGroup.Option>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    disabled={selected === null}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    onClick={async () => {
                      const role = selected?.value || 'READER';
                      const res = await updateMemberRole(group.id, user?.id || '', role).catch((e) => null);
                      if (!res || (res && 'error' in res)) {
                        alert(res?.error || 'エラーが発生しました');
                        return;
                      }
                      setOpen(false);
                    }}
                  >
                    ユーザー設定を変更
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

function DeleteUserModal({ group, user }: { group: Group; user: User | null }) {
  const [open, setOpen] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<string>('');

  useEffect(() => {
    if (user) {
      setOpen(true);
      setConfirm('');
    }
  }, [user]);

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
                      メンバーの削除
                    </Dialog.Title>
                    <div className="mt-2">
                      <div className="text-sm">
                        <p className="text-gray-800 my-4">
                          以下のメンバーを削除しようとしています。この操作は取り消せません。
                        </p>
                        <div className="mt-4 mx-2 flex items-center gap-3 shadow-sm shadow-gray-300 rounded-md border border-gray-300 p-2">
                          <img
                            className="inline-flex w-8 h-8 rounded-full"
                            src={`/api/users/${user?.uid}/icon`}
                            alt="user icon"
                          />
                          <div>
                            <div className="text-gray-500 text-xs">@{user?.handle}</div>
                            <div className="text-sm">{user?.name}</div>
                          </div>
                        </div>
                        <p className="text-gray-600 my-4">この操作について、以下の点に注意してください。</p>
                        <ul className="text-gray-900 list-disc font-semibold ml-4">
                          <li className="my-1">このメンバーがこのグループに投稿したノートは削除されません</li>
                          <li className="my-1">
                            このメンバーがこのグループに投稿したノートの所有権は変わらずこのユーザーに残り、このユーザーに編集・削除する権利が残ります
                          </li>
                          <li className="my-1">
                            このメンバーが投稿したノートを、他のメンバーが編集・削除することはできません
                          </li>
                        </ul>
                        <div className="my-5">
                          <p>内容を確認したら、ユーザーのハンドル名を入力します</p>
                          <input
                            type="text"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="mt-0.5 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    disabled={confirm.replace('@', '') !== user?.handle}
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:bg-red-300 disabled:cursor-not-allowed"
                    onClick={async () => {
                      const res = await removeMemberFromGroup(group.id, user?.id || '')
                        .then((data) => ({ ...data, error: null }))
                        .catch((e) => ({ error: e.message }));
                      if (res.error) {
                        alert(res.error);
                      } else {
                        setOpen(false);
                      }
                    }}
                  >
                    ユーザーを削除
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
