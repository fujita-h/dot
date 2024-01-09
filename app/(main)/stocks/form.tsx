'use client';

import clsx from 'clsx/lite';
import { useRouter } from 'next/navigation';

interface Label {
  id: string;
  name: string;
  _count: {
    Stocks: number;
  };
}

export function LabelsList({
  category,
  labels,
  total,
}: {
  category: string | undefined | null;
  labels: Label[];
  total: number;
}) {
  const router = useRouter();
  const handleLabelChanged = (label: Label | undefined) => {
    const searchParams = label ? new URLSearchParams({ category: label.id }) : new URLSearchParams();
    router.push(`?${searchParams.toString()}`);
  };

  return (
    <ul role="list" className="grid grid-cols-1 gap-1">
      <li className="relative">
        <button
          onClick={() => handleLabelChanged(undefined)}
          className={clsx(
            category === undefined
              ? 'bg-indigo-200 text-gray-900'
              : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
            'group w-full flex items-center px-2 py-1 rounded-md'
          )}
        >
          <span className="truncate">All</span>
          <span
            className={clsx(
              category === undefined
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'ml-auto inline-block px-3 rounded-full'
            )}
          >
            {total || 0}
          </span>
        </button>
      </li>
      {labels.map((label) => {
        const count = label._count?.Stocks || 0;
        return (
          <li key={label.id} className="relative">
            <button
              onClick={() => handleLabelChanged(label)}
              className={clsx(
                category === label.id
                  ? 'bg-indigo-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
                'group w-full flex items-center px-2 py-1 rounded-md'
              )}
            >
              <span className="truncate pr-1">{label.name}</span>
              <span
                className={clsx(
                  category === label.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'ml-auto inline-block px-3 rounded-full'
                )}
              >
                {count}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
