'use client';

import { SITE_NAME } from '@/libs/constants';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import clsx from 'clsx/lite';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { SignOutModal } from './sign-out-modal';

const userNavigation = [
  { name: 'プロフィール', href: '/profile' },
  { name: 'ストック', href: '/stocks' },
  { name: '下書き', href: '/drafts' },
  { name: '設定', href: '/settings' },
];

export function EditorNavbar({
  group,
  formDraftAction,
  formPublishAction,
  showAutoSavingMessage,
}: {
  group?: { id: string; name: string } | null;
  formDraftAction: () => void;
  formPublishAction: () => void;
  showAutoSavingMessage: boolean;
}) {
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  return (
    <div className="relative z-50 border-b border-inset">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="flex h-14 justify-between">
          <div className="flex flex-shrink-0 items-center">
            <Link href="/">
              <div className="flex items-center">
                <div className="pt-1">
                  <span className="text-2xl text-gray-700 font-semibold">{SITE_NAME}</span>
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-4 max-w-60 h-full pt-3">
              <div className="text-right text-sm leading-4">
                {group ? (
                  <div className="inline-flex gap-1 w-full">
                    <img
                      src={`/api/groups/${group.id}/icon`}
                      width={16}
                      height={16}
                      className="rounded-md"
                      alt="grou-icon"
                    />
                    <span className="text-gray-800 truncate">{group.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-800">For all users</span>
                )}
              </div>
              <div className="text-right text-sm leading-4">
                <AutoSavingMessage show={showAutoSavingMessage} />
              </div>
            </div>
            <DraftButton onClick={formDraftAction} />
            <PublishButton onClick={formPublishAction} />
            {/* Profile dropdown */}
            <Menu as="div" className="ml-1 relative flex-shrink-0">
              <div>
                <MenuButton className="flex rounded-full bg-white text-sm focus:outline-none hover:ring-gray-300 hover:ring-2 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span className="sr-only">Open user menu</span>
                  <img src="/api/user/icon" width={32} height={32} className="rounded-full" alt="user-icon" />
                </MenuButton>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-2 ring-black ring-opacity-5 focus:outline-none">
                  {userNavigation.map((item) => (
                    <MenuItem key={item.name}>
                      {({ focus }) => (
                        <Link
                          href={item.href}
                          className={clsx(
                            focus ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm font-semibold text-gray-600'
                          )}
                        >
                          {item.name}
                        </Link>
                      )}
                    </MenuItem>
                  ))}
                  <MenuItem>
                    {({ focus }) => (
                      <span
                        className={clsx(
                          focus ? 'bg-red-100' : '',
                          'block px-4 py-2 text-sm font-semibold text-gray-600 hover:cursor-pointer'
                        )}
                        onClick={() => setSignOutModalOpen(true)}
                      >
                        サインアウト
                      </span>
                    )}
                  </MenuItem>
                </MenuItems>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
      <SignOutModal open={signOutModalOpen} setOpen={setSignOutModalOpen} />
    </div>
  );
}

function AutoSavingMessage({ show }: { show: boolean }) {
  return (
    <Transition
      show={show}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-100"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <span className="px-1 text-sm leading-4 font-medium text-indigo-500 animate-pulse">Auto-Saving...</span>
    </Transition>
  );
}

function DraftButton({ onClick }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-400 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
    >
      下書きに保存
    </button>
  );
}

function PublishButton({ onClick }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
    >
      公開する
    </button>
  );
}
