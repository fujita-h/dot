'use client';

import { Popover, Transition } from '@headlessui/react';
import { ArchiveBoxIcon, FolderPlusIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { ChangeEvent, Fragment, useState } from 'react';
import { stockDefault, stock, unStock, createLabel } from './action';
import { set } from 'lodash';

export function Form({
  noteId,
  stockedLabels: _stockedLabels,
  labels: _labels,
  count: _count,
  showCounter = true,
  showRing = true,
  popoverDirection = 'right',
}: {
  noteId: string;
  stockedLabels: any[];
  labels: any[];
  count: number;
  showCounter?: boolean;
  showRing?: boolean;
  popoverDirection?: 'left' | 'right';
}) {
  const [stockedLabels, setStockedLabels] = useState(_stockedLabels);
  const [labels, setLabels] = useState(_labels);
  const [count, setCount] = useState(_count);
  const [newLabelName, setNewLabelName] = useState('');

  const handleButtonClick = () => {
    if (stockedLabels.length == 0) {
      stockDefault(noteId)
        .then((res) => {
          setStockedLabels(res.stockedLabels);
          setLabels(res.labels);
          setCount(res.count);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  const handleChangeLabelCheckbox = (e: ChangeEvent<HTMLInputElement>, labelId: string) => {
    if (e.target.checked) {
      stock(noteId, labelId)
        .then((res) => {
          setStockedLabels(res.stockedLabels);
          setCount(res.count);
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      unStock(noteId, labelId)
        .then((res) => {
          setStockedLabels(res.stockedLabels);
          setCount(res.count);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  const handleCreateLabel = () => {
    if (newLabelName === '') return;
    createLabel(newLabelName)
      .then((res) => {
        setLabels(res.labels);
        setNewLabelName('');
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <Popover>
      <div className="relative z-20">
        <div className="flex flex-col w-10">
          <Popover.Button
            as="div"
            className={clsx(
              'h-10 rounded-full bg-white flex items-center justify-center hover:cursor-pointer',
              showRing ? 'ring-1 ring-gray-300' : 'ring-0',
              stockedLabels.length > 0 ? 'text-blue-600 hover:text-blue-500' : 'text-gray-300 hover:text-gray-400'
            )}
            onClick={handleButtonClick}
          >
            <ArchiveBoxIcon className={clsx('w-6 h-6')} />
          </Popover.Button>
          {showCounter ? <div className="text-center font-bold text-gray-500">{count}</div> : <></>}
        </div>
        <Popover.Overlay className="fixed inset-0" />
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Popover.Panel
            className={clsx(
              popoverDirection === 'right' ? '-top-3 left-12' : '',
              popoverDirection === 'left' ? '-top-3 right-12' : '',
              'absolute shadow-xl bg-white ring-1 ring-gray-300 rounded-md'
            )}
            focus={true}
          >
            <div className="p-4 w-80">
              <fieldset>
                <legend className="sr-only">Stock labels</legend>
                <div className="space-y-2">
                  {labels.map((label) => (
                    <div key={label.id} className="relative flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          id={label.id}
                          name={label.id}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          checked={stockedLabels.find((stock) => stock.labelId === label.id) ? true : false}
                          onChange={(e) => handleChangeLabelCheckbox(e, label.id)}
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label htmlFor={label.id} className="font-medium text-gray-900">
                          {label.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>

              <div className="flex gap-2 items-center mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1 pb-1">
                      <FolderPlusIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="test"
                      className="block w-full pl-8 text-sm border-0 ring-0 shadow-none border-b border-gray-400 focus:border-indigo-600 focus-visible:outline-none"
                      placeholder="新規カテゴリー"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <button
                    className="rounded-md text-sm border border-gray-400 p-1 focus:ring-0 focus-visible:outline-indigo-500"
                    onClick={handleCreateLabel}
                  >
                    作成
                  </button>
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </div>
    </Popover>
  );
}
