'use client';

import '@/components/editor/style.css';
import '@/components/tiptap/tiptap.css';
import { Editor, EditorContent } from '@tiptap/react';
import clsx from 'clsx';
import { TopicInput, Item as TopicItem } from './topic-input';

export function EditorForm({
  title,
  topics,
  topicOptions,
  editor,
  onTitleChange,
  onTopicsChange,
}: {
  title: string;
  topics: TopicItem[];
  topicOptions: TopicItem[];
  editor: Editor | null;
  onTitleChange?: (title: string) => void;
  onTopicsChange?: (topics: TopicItem[]) => void;
}) {
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
            onChange={(e) => {
              onTitleChange && onTitleChange(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <div className="flex-1 h-[44px]">
          <TopicInput
            selected={topics}
            options={topicOptions}
            onChange={(e) => {
              onTopicsChange && onTopicsChange(e);
            }}
          />
        </div>
      </div>
      <div
        className={clsx(
          'h-[calc(100%_-_104px)] grid mb-2' // 104px = 44px + 8px (margin) +  44px + 8px (margin)
        )}
      >
        <div className="px-2 pb-1 bg-white w-full h-full rounded-md ring-1 ring-inset ring-gray-300">
          <div className="note">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
