'use client';

import clsx from 'clsx/lite';

export function ButtonTemplate({
  children,
  id,
  active,
  onClick,
  prevButtonId,
  nextButtonId,
}: {
  children: React.ReactNode;
  id?: string;
  active?: boolean;
  onClick?: () => void;
  prevButtonId?: string;
  nextButtonId?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      className={clsx(
        active ? 'bg-indigo-500/30' : 'hover:bg-gray-200',
        'px-1 group rounded-md focus:outline-1 focus:outline-gray-500'
      )}
      onClick={onClick}
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
      <span className={active ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}>{children}</span>
    </button>
  );
}
