'use client';

import { SITE_NAME } from '@/libs/constants';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useRef } from 'react';

const navigation = [
  { name: 'トレンド', href: '/', current: false, matchPath: /^\/$/ },
  { name: 'タイムライン', href: '/timeline', current: false, matchPath: /^\/timeline/ },
  { name: 'グループ', href: '/groups', current: false, matchPath: /^\/groups/ },
  { name: 'トピック', href: '/topics', current: false, matchPath: /^\/topics/ },
];
const userNavigation = [
  { name: 'プロフィール', href: '/profile' },
  { name: 'ストック', href: '/stocks' },
  { name: '下書き', href: '/drafts' },
  { name: '設定', href: '/settings' },
];

export function Navbar({ userName, groups }: { userName: string; groups: { id: string; name: string }[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  navigation.forEach((item) => {
    item.current = item.matchPath.test(pathname);
  });
  return (
    <div className="bg-white">
      <div className="max-w-screen-2xl mx-auto">
        <Disclosure as="nav" className="bg-white">
          {({ open }) => (
            <>
              <div className="mx-auto px-2 sm:px-4 lg:px-8">
                <div className="flex h-14 justify-between">
                  <div className="flex lg:flex-col justify-center px-2 lg:px-0">
                    <div className="flex flex-shrink-0 items-center">
                      <Link href="/">
                        <div className="flex items-center">
                          <div className="pt-2 pl-[0.375rem]">
                            <span className="text-[1.8rem] leading-[2rem] text-gray-700 font-semibold">
                              {SITE_NAME}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center lg:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                  <div className="hidden lg:ml-4 lg:flex lg:items-center lg:gap-1">
                    <div className="w-full max-w-lg lg:max-w-xs">
                      <label htmlFor="search" className="sr-only">
                        Search
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <form
                          action={(e) => {
                            const query = e.get('search');
                            if (query) {
                              if (searchInputRef.current) {
                                searchInputRef.current.value = '';
                                searchInputRef.current.blur();
                              }
                              router.push(`/search?q=${query}`);
                            }
                          }}
                        >
                          <input
                            ref={searchInputRef}
                            name="search"
                            className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Search"
                            type="search"
                            autoComplete="off"
                          />
                        </form>
                      </div>
                    </div>
                    {/* <button
                      type="button"
                      className="flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-7 w-7" aria-hidden="true" />
                    </button> */}
                    {/* Profile dropdown */}
                    <Menu as="div" className="ml-1 relative flex-shrink-0">
                      <div>
                        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none hover:ring-gray-300 hover:ring-2 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                          <span className="sr-only">Open user menu</span>
                          <img src="/api/user/icon" width={32} height={32} className="rounded-full" alt="user-icon" />
                        </Menu.Button>
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
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-2 ring-black ring-opacity-5 focus:outline-none">
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  href={item.href}
                                  className={clsx(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm font-semibold text-gray-600'
                                  )}
                                >
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                    <Menu as="div" className="ml-2 relative flex-shrink-0">
                      <div>
                        <Menu.Button className="flex rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium font-noto-sans-jp text-white shadow-sm hover:bg-indigo-500 hover:cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                          <span>投稿する</span>
                        </Menu.Button>
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
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-auto min-w-[240px] max-w-[420px] origin-top-right divide-y divide-gray-100 rounded-md bg-white py-1 shadow-lg ring-2 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  href="/drafts/new"
                                  className={clsx(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm font-noto-sans-jp font-semibold text-gray-600'
                                  )}
                                >
                                  投稿する
                                </a>
                              )}
                            </Menu.Item>
                          </div>
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  href="/drafts/new"
                                  className={clsx(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm font-noto-sans-jp font-semibold text-gray-600'
                                  )}
                                >
                                  下書き
                                </a>
                              )}
                            </Menu.Item>
                          </div>
                          <div className="py-1">
                            <div className="block px-4 py-2 text-sm font-noto-sans-jp font-semibold text-gray-600">
                              グループに投稿する
                            </div>
                            {groups.map((group) => (
                              <Menu.Item key={group.id}>
                                {({ active }) => (
                                  <a
                                    href={`/drafts/new?group=${group.id}`}
                                    className={clsx(
                                      active ? 'bg-gray-100' : '',
                                      'flex items-center gap-2 px-4 py-2 text-sm font-noto-sans-jp font-semibold text-gray-600'
                                    )}
                                  >
                                    <img
                                      src={`/api/groups/${group.id}/icon`}
                                      className="w-5 h-5 rounded-sm border border-gray-100"
                                      alt="group-icon"
                                    />
                                    <div className="truncate">{group.name}</div>
                                  </a>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
                <div>
                  <div className="hidden lg:flex lg:space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={clsx(
                          'inline-flex items-end border-b-2 px-1 pt-1 text-sm font-noto-sans-jp font-semibold',
                          item.current
                            ? 'border-indigo-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="lg:hidden">
                <div className="space-y-1 pb-3 pt-2">
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <Disclosure.Button
                        as="span"
                        className={clsx(
                          'block border-l-4 py-2 pl-3 pr-4 text-base font-medium',
                          item.current
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Disclosure.Button>
                    </Link>
                  ))}
                </div>
                <div className="border-t mb-4 border-gray-200 pb-3 pt-4">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <img src="/api/user/icon" width={40} height={40} className="rounded-full" alt="user-icon" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{userName}</div>
                    </div>
                    <div className="ml-auto flex-shrink-0 flex gap-2">
                      <Link
                        href="/search"
                        className=" rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <span className="sr-only">Search</span>
                        <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
                      </Link>
                      {/* <button
                        type="button"
                        className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button> */}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userNavigation.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <Disclosure.Button
                          as="span"
                          className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          {item.name}
                        </Disclosure.Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
}
