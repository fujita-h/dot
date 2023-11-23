'use client';

import { EditorForm } from '@/components/editor/form';
import { Item as TopicItem } from '@/components/editor/topic-input';
import { SITE_NAME } from '@/libs/constants';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { ActionState, action } from './action';

const initialActionState: ActionState = {
  submit: null,
  status: null,
  message: null,
  redirect: null,
  lastModified: 0,
};

function PublishButton({ action }: { action: (payload: FormData) => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={action}
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
    >
      公開する
    </button>
  );
}

function DraftButton({ action }: { action: (payload: FormData) => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={action}
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-400 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
    >
      下書きに保存
    </button>
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
      <span className="px-1 text-sm font-medium text-indigo-500 animate-pulse">Auto-Saving...</span>
    </Transition>
  );
}

export function Form({
  draftId,
  groupId,
  relatedNoteId,
  title,
  body,
  topics,
  topicOptions,
}: {
  draftId: string;
  groupId: string | undefined;
  relatedNoteId: string | undefined;
  title: string;
  body: string;
  topics: TopicItem[];
  topicOptions: TopicItem[];
}) {
  const router = useRouter();
  const [publishActionState, formPublishAction] = useFormState(action, { ...initialActionState, submit: 'publish' });
  const [draftActionState, formDraftAction] = useFormState(action, { ...initialActionState, submit: 'draft' });
  const [autoSaveActionState, formAutoSaveAction] = useFormState(action, { ...initialActionState, submit: 'autosave' });
  const autoSaveButtonRef = useRef<HTMLButtonElement>(null);
  const [showAutoSavingMessage, setShowAutoSavingMessage] = useState(false);

  useEffect(() => {
    if (publishActionState.status === 'success') {
      if (publishActionState.redirect) {
        router.replace(publishActionState.redirect);
      }
    }
    publishActionState.submit = 'publish';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishActionState.lastModified]);

  useEffect(() => {
    if (draftActionState.status === 'success') {
      if (draftActionState.redirect) {
        router.replace(draftActionState.redirect);
      }
    }
    draftActionState.submit = 'draft';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftActionState.lastModified]);

  useEffect(() => {
    if (autoSaveActionState.status === 'success') {
      if (autoSaveActionState.redirect) {
        setShowAutoSavingMessage(true);
      }
    }
    autoSaveActionState.submit = 'autosave';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveActionState.lastModified]);

  useEffect(() => {
    if (!showAutoSavingMessage) return;
    const timer = setTimeout(() => {
      setShowAutoSavingMessage(false);
    }, 2800);
    return () => {
      clearTimeout(timer);
    };
  }, [showAutoSavingMessage]);

  return (
    <form className="h-full">
      <NavBar
        formDraftAction={formDraftAction}
        formPublishAction={formPublishAction}
        showAutoSavingMessage={showAutoSavingMessage}
      />
      <button type="submit" hidden={true} ref={autoSaveButtonRef} formAction={formAutoSaveAction}></button>
      <div className="h-[calc(100%_-_56px)] p-2">
        <input type="hidden" name="draftId" value={draftId} />
        <input type="hidden" name="groupId" value={groupId} />
        <input type="hidden" name="relatedNoteId" value={relatedNoteId} />
        <div className="h-full">
          <EditorForm
            title={title}
            body={body}
            topics={topics}
            topicOptions={topicOptions}
            onChange={(x) => {
              autoSaveButtonRef.current?.click();
            }}
          />
        </div>
      </div>
    </form>
  );
}

const userNavigation = [
  { name: 'プロフィール', href: '/profile' },
  { name: 'ストック', href: '/stocks' },
  { name: '下書き', href: '/drafts' },
  { name: '設定', href: '/settings' },
];

function NavBar({
  formDraftAction,
  formPublishAction,
  showAutoSavingMessage,
}: {
  formDraftAction: (payload: FormData) => void;
  formPublishAction: (payload: FormData) => void;
  showAutoSavingMessage: boolean;
}) {
  return (
    <div className="bg-white">
      <div className="mx-auto px-8">
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
            <AutoSavingMessage show={showAutoSavingMessage} />
            <DraftButton action={formDraftAction} />
            <PublishButton action={formPublishAction} />
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
          </div>
        </div>
      </div>
    </div>
  );
}
