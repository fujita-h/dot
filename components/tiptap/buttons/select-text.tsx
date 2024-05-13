'use client';

import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Editor } from '@tiptap/react';
import clsx from 'clsx/lite';
import { Fragment } from 'react';
import { AiOutlineCode } from 'react-icons/ai';
import { BsTextParagraph } from 'react-icons/bs';
import { LuHeading1, LuHeading2, LuHeading3 } from 'react-icons/lu';
import { PiListChecks, PiListDashes, PiListNumbers } from 'react-icons/pi';

export function ButtonSelectText({
  editor,
  id,
  prevButtonId,
  nextButtonId,
}: {
  editor: Editor;
  id?: string;
  prevButtonId?: string;
  nextButtonId?: string;
}) {
  return (
    <Menu as="div" className="relative text-left">
      <div>
        <Menu.Button
          id={id}
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-xl font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              if (prevButtonId) {
                e.preventDefault();
                document.getElementById(prevButtonId)?.focus();
              }
            }
            if (e.key === 'ArrowRight') {
              if (nextButtonId) {
                e.preventDefault();
                document.getElementById(nextButtonId)?.focus();
              }
            }
          }}
        >
          {editor.isActive('paragraph') && !editor.isActive('listItem') && !editor.isActive('taskItem') && (
            <BsTextParagraph />
          )}
          {editor.isActive('heading', { level: 1 }) && <LuHeading1 />}
          {editor.isActive('heading', { level: 2 }) && <LuHeading2 />}
          {editor.isActive('heading', { level: 3 }) && <LuHeading3 />}
          {editor.isActive('bulletList') && <PiListDashes />}
          {editor.isActive('orderedList') && <PiListNumbers />}
          {editor.isActive('taskList') && <PiListChecks />}
          {editor.isActive('codeBlock') && <AiOutlineCode />}
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
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
        <Menu.Items className="absolute left-0 z-10 mt-2 px-1 origin-top-left divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-1 my-1 py-1 rounded-md'
                  )}
                  onClick={() => {
                    if (editor.isActive('listItem')) {
                      editor.chain().focus().liftListItem('listItem').run();
                    }
                    editor.chain().focus().setParagraph().run();
                  }}
                >
                  <span
                    className={clsx(
                      editor.isActive('paragraph') && !editor.isActive('listItem')
                        ? 'bg-indigo-500/30'
                        : 'hover:bg-gray-200',
                      'text-xl font-semibold p-1 rounded-md'
                    )}
                  >
                    <BsTextParagraph />
                  </span>
                  <span className="ml-2 text-base whitespace-nowrap">Paragraph</span>
                </button>
              )}
            </Menu.Item>
          </div>
          <div>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-1 my-1 py-1 rounded-md'
                  )}
                  onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
                >
                  <span
                    className={clsx(
                      editor.isActive('heading', { level: 1 }) ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                      'text-xl font-semibold p-1 rounded-md'
                    )}
                  >
                    <LuHeading1 />
                  </span>
                  <span className="mx-2 text-base whitespace-nowrap">Heading 1</span>
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-1 my-1 py-1 rounded-md'
                  )}
                  onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
                >
                  <span
                    className={clsx(
                      editor.isActive('heading', { level: 2 }) ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                      'text-xl font-semibold p-1 rounded-md'
                    )}
                  >
                    <LuHeading2 />
                  </span>
                  <span className="mx-2 text-base whitespace-nowrap">Heading 2</span>
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-1 my-1 py-1 rounded-md'
                  )}
                  onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
                >
                  <span
                    className={clsx(
                      editor.isActive('heading', { level: 3 }) ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                      'text-xl font-semibold p-1 rounded-md'
                    )}
                  >
                    <LuHeading3 />
                  </span>
                  <span className="mx-2 text-base whitespace-nowrap">Heading 3</span>
                </button>
              )}
            </Menu.Item>
          </div>
          <div>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-1 my-1 py-1 rounded-md'
                  )}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                  <span
                    className={clsx(
                      editor.isActive('bulletList') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                      'text-xl font-semibold p-1 rounded-md'
                    )}
                  >
                    <PiListDashes />
                  </span>
                  <span className="mx-2 text-base whitespace-nowrap">Bullet List</span>
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-1 my-1 py-1 rounded-md'
                  )}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                  <span
                    className={clsx(
                      editor.isActive('orderedList') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                      'text-xl font-semibold p-1 rounded-md'
                    )}
                  >
                    <PiListNumbers />
                  </span>
                  <span className="mx-2 text-base whitespace-nowrap">Ordered List</span>
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-1 my-1 py-1 rounded-md'
                  )}
                  onClick={() => editor.chain().focus().toggleTaskList().run()}
                >
                  <span
                    className={clsx(
                      editor.isActive('taskList') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                      'text-xl font-semibold p-1 rounded-md'
                    )}
                  >
                    <PiListChecks />
                  </span>
                  <span className="mx-2 text-base whitespace-nowrap">Task List</span>
                </button>
              )}
            </Menu.Item>
          </div>
          <div>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-1 my-1 py-1 rounded-md'
                  )}
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                  <span
                    className={clsx(
                      editor.isActive('orderedList') ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
                      'text-xl font-semibold p-1 rounded-md'
                    )}
                  >
                    <AiOutlineCode />
                  </span>
                  <span className="mx-2 text-base whitespace-nowrap">CodeBlock</span>
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
