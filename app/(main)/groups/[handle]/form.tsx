'use client';

import { Menu, Transition } from '@headlessui/react';
import { Cog8ToothIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx/lite';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';
import { setFollow } from './action';

export function FollowToggleButton({ id, isFollowing }: { id: string; isFollowing: boolean }) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-full focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-gray-500 hover:cursor-pointer',
        isFollowing ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      )}
      onClick={() => setFollow(id, !isFollowing)}
    >
      {isFollowing ? 'フォロー中' : 'フォロー'}
    </button>
  );
}

export function OtherMenuButton({ id }: { id: string }) {
  const router = useRouter();
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
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'group flex items-center px-4 py-3 text-sm hover:cursor-pointer'
                    )}
                    onClick={() => router.push(`/groups/0/${id}/settings`)}
                  >
                    <Cog8ToothIcon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    設定
                  </span>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
