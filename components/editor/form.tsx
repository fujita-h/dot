'use client';

import { FileDropTextarea } from '@/components/file-drop-textarea/form';
import mdStyles from '@/components/notes/styles.module.css';
import { Parser } from '@/components/react-markdown/parser';
import { DocumentTextIcon, PencilSquareIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { TopicInput, Item as TopicItem } from './topic-input';

export function EditorForm({
  title,
  body,
  topics,
  topicOptions,
  onChange,
}: {
  title: string;
  body: string;
  topics: TopicItem[];
  topicOptions: TopicItem[];
  onChange?: (key: string) => void;
}) {
  const [markdown, setMarkdown] = useState(body);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'both'>('both');
  const [autoSaveTimestamp, setAutoSaveTimestamp] = useState(0);

  useEffect(() => {
    if (autoSaveTimestamp === 0) {
      return;
    }
    const timer = setTimeout(() => {
      onChange?.('x-auto-save');
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveTimestamp]);

  return (
    <div className="h-full">
      <div className="flex gap-2 mb-2">
        <div className="flex-1 h-[44px]">
          <input
            type="text"
            name="title"
            className="block w-full h-full rounded-md border-0 py-1.5 text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-400 sm:leading-6"
            placeholder="Title"
            autoComplete="off"
            defaultValue={title}
            onChange={() => {
              setAutoSaveTimestamp(Date.now());
            }}
          />
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <div className="flex-1 h-[44px]">
          <TopicInput
            selected={topics}
            options={topicOptions}
            onChange={() => {
              setAutoSaveTimestamp(Date.now());
            }}
          />
        </div>
        <div className="bg-white h-[44px] ring-gray-300 shadown-sm border-0 ring-1 ring-inset rounded-md p-1 px-2 mr-0.5 flex gap-2 items-center">
          <PencilSquareIcon
            className={clsx(
              'h-6 w-6',
              editorMode === 'edit'
                ? 'text-indigo-600 bg-indigo-50 rounded-md'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-600 hover:cursor-pointer'
            )}
            aria-hidden="true"
            onClick={() => {
              setEditorMode('edit');
            }}
          />
          <ViewColumnsIcon
            className={clsx(
              'h-6 w-6',
              editorMode === 'both'
                ? 'text-indigo-600 bg-indigo-50 rounded-md'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-600 hover:cursor-pointer'
            )}
            aria-hidden="true"
            onClick={() => {
              setEditorMode('both');
            }}
          />
          <DocumentTextIcon
            className={clsx(
              'h-6 w-6',
              editorMode === 'preview'
                ? 'text-indigo-600 bg-indigo-50 rounded-md'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-600 hover:cursor-pointer'
            )}
            aria-hidden="true"
            onClick={() => {
              setEditorMode('preview');
            }}
          />
        </div>
      </div>
      <div
        className={clsx(
          'h-[calc(100%_-_104px)] grid mb-2', // 104px = 44px + 8px (margin) +  44px + 8px (margin)
          editorMode === 'both' ? 'grid-cols-2 gap-2' : 'grid-cols-1'
        )}
      >
        <div className="w-full h-full" hidden={editorMode === 'preview'}>
          {/**
           * Which is best?
           * value={markdown} or value={body}
           *
           * value={markdown} benefits:
           *   Keep the state of FileDropTextarea and MarkdownEditor in sync.
           *
           * value={body} benefits:
           *   FileDropTextarea keeps its own state. So, it is not necessary to use {markdown} state.
           *   Re-rendering is not fired, so good for performance.
           *
           */}
          <FileDropTextarea
            className="text-sm leading-6 text-gray-900"
            value={body}
            placeholder="Write markdown here..."
            onChange={(value) => {
              setMarkdown(value);
              setAutoSaveTimestamp(Date.now());
            }}
          />
        </div>
        <div
          className={clsx(
            editorMode === 'edit' ? 'hidden' : 'block',
            'thin-scrollbar w-full rounded-md border-0 px-4 py-2 ring-1 ring-inset ring-gray-300 bg-white break-words overflow-y-scroll'
          )}
        >
          <Parser addHeaderAnchor={false} className={mdStyles.note}>
            {markdown}
          </Parser>
        </div>
      </div>
    </div>
  );
}
