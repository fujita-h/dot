'use client';

import { EditorForm } from '@/components/editor/form';
import { Item as TopicItem } from '@/components/editor/topic-input';
import { action, ActionState } from './action';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { CheckIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

const initialActionState: ActionState = {
  status: null,
  message: null,
  redirect: null,
  lastModified: 0,
};

const publishingOptions = [
  {
    title: '公開する',
    description: 'This job posting can be viewed by anyone who has the link.',
    value: 'publish',
    current: true,
  },
  {
    title: '下書きに保存',
    description: 'This job posting will no longer be publicly accessible.',
    value: 'draft',
    current: false,
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  const [selected, setSelected] = useState(publishingOptions[0]);

  return (
    <Listbox disabled={pending} value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <Listbox.Label className="sr-only">Change published status</Listbox.Label>
          <div className="relative">
            <input type="hidden" name="submit" value={selected.value} />
            <div className="inline-flex divide-x divide-indigo-700 rounded-md shadow-sm">
              <button
                type="submit"
                disabled={pending}
                aria-disabled={pending}
                className="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white shadow-sm disabled:cursor-wait disabled:bg-indigo-600/70"
              >
                <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                <p className="text-sm font-semibold">{selected.title}</p>
              </button>
              <button
                type="button"
                disabled={pending}
                className="rounded-l-none rounded-r-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:cursor-wait disabled:bg-indigo-600/70"
              >
                <Listbox.Button as="div" className="inline-flex items-center p-2 disabled:cursor-wait">
                  <span className="sr-only">Change published status</span>
                  <ChevronUpIcon className="h-5 w-5 text-white" aria-hidden="true" />
                </Listbox.Button>
              </button>
            </div>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute bottom-11 right-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {publishingOptions.map((option) => (
                  <Listbox.Option
                    key={option.title}
                    className={({ active }) =>
                      clsx(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'cursor-default select-none p-4 text-sm'
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <p className={selected ? 'font-semibold' : 'font-normal'}>{option.title}</p>
                          {selected ? (
                            <span className={active ? 'text-white' : 'text-indigo-600'}>
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </div>
                        <p className={clsx(active ? 'text-indigo-200' : 'text-gray-500', 'mt-2')}>
                          {option.description}
                        </p>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
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
  const [actionState, formAction] = useFormState(action, initialActionState);
  const router = useRouter();

  useEffect(() => {
    if (actionState.status === 'success') {
      if (actionState.redirect) {
        router.push(actionState.redirect);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionState.lastModified]);

  return (
    <div className="h-full p-2">
      <form className="h-full" action={formAction}>
        <input type="hidden" name="draftId" value={draftId} />
        <input type="hidden" name="groupId" value={groupId} />
        <input type="hidden" name="relatedNoteId" value={relatedNoteId} />
        <div className="h-[calc(100%_-_44px)]">
          <EditorForm title={title} body={body} topics={topics} topicOptions={topicOptions} />
        </div>
        <div className="relative flex mt-2 justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
