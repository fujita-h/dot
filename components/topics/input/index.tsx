'use client';

import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useState } from 'react';

export interface TopicItem {
  id: string;
  handle: string;
  name: string;
}

export function TopicInput({
  selected,
  options,
  onChange,
}: {
  selected: TopicItem[];
  options: TopicItem[];
  onChange: (values: TopicItem[]) => void;
}) {
  const [items, setItems] = useState(selected);

  return (
    <div className="border-0 rounded-md px-2 py-1.5 ring-1 ring-inset ring-gray-300 focus:ring-1 focus:ring-inset focus:ring-indigo-400 shadow-sm bg-white w-full text-sm flex gap-1.5">
      {items.map((item) => (
        <input type="hidden" name="topics" key={item.id} value={item.id} />
      ))}
      <DndContext
        // Unique id is required for avoid warning: "Prop `aria-describedby` did not match."
        // See https://github.com/clauderic/dnd-kit/issues/926
        id="dnd-context-topics-input"
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (over == null || active.id === over.id) {
            return;
          }
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          const newItems = arrayMove(items, oldIndex, newIndex);
          setItems(newItems);
          onChange(newItems);
        }}
      >
        <SortableContext items={items}>
          <div className="flex gap-1.5">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onDelete={(item) => {
                  const newItems = items.filter((i) => i.id !== item.id);
                  setItems(newItems);
                  onChange(newItems);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className={items.length >= 5 ? 'hidden' : ''}>
        <TopicsComboBox
          options={options.filter((option) => !items.some((item) => item.id === option.id))}
          onChange={(item) => {
            const newItems = [...new Set([...items, item])];
            setItems(newItems);
            onChange(newItems);
          }}
        />
      </div>
    </div>
  );
}

function SortableItem({ item, onDelete }: { item: TopicItem; onDelete: (value: TopicItem) => void }) {
  const { isDragging, setActivatorNodeRef, attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });
  return (
    <div
      ref={setNodeRef}
      className={clsx('relative', isDragging ? 'z-[1]' : '')}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="flex items-center gap-2 px-2 py-1 border-0 ring-1 ring-inset ring-gray-300 rounded-md bg-white">
        <div className="flex items-center relative gap-2">
          <span
            className="absolute inset-x-0 -top-px bottom-0"
            ref={setActivatorNodeRef}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            {...attributes}
            {...listeners}
          />
          <img src={`/api/topics/${item.id}/icon`} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" />
          <div className="flex-1">{item.handle}</div>
        </div>
        <div
          className="text-gray-500 hover:text-red-700 hover:cursor-pointer"
          onClick={() => {
            onDelete(item);
          }}
        >
          <XMarkIcon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function TopicsComboBox({ options, onChange }: { options: TopicItem[]; onChange: (value: TopicItem) => void }) {
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<TopicItem | null>(null);

  const handleChange = (topic: TopicItem) => {
    setQuery('');
    setSelectedItem(null);
    onChange(topic);
  };

  const filteredOptions =
    query === '' ? options : options.filter((option) => option.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Combobox as="div" value={selectedItem} onChange={handleChange}>
      <div className="relative">
        <Combobox.Input
          className="w-full rounded-md border-0 bg-white pt-2 pb-1 pl-3 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-1 focus:ring-inset focus:ring-indigo-600 text-sm"
          onKeyDown={(event) => {
            if (filteredOptions.length === 0 && event.key === 'Enter') {
              event.preventDefault();
            }
          }}
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(person: any) => person?.name}
          placeholder="トピック..."
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredOptions.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.map((item) => (
              <Combobox.Option
                key={item.id}
                value={item}
                className={({ active }) =>
                  clsx(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex items-center">
                      <img src={`/api/topics/${item.id}/icon`} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" />
                      <span className={clsx('ml-3 truncate', selected && 'font-semibold')}>{item.name}</span>
                    </div>

                    {selected && (
                      <span
                        className={clsx(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-indigo-600'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}
