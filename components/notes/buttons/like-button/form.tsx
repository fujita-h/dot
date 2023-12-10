'use client';

import { HeartIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useState } from 'react';
import { like, unLike } from './action';

export function Form({ noteId, liked: _liked, count: _count }: { noteId: string; liked: boolean; count: number }) {
  const [liked, setLiked] = useState(_liked);
  const [count, setCount] = useState(_count);
  const handleButtonClick = () => {
    if (liked) {
      unLike(noteId)
        .then((res) => {
          setLiked(res.liked);
          setCount(res.count);
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      like(noteId)
        .then((res) => {
          setLiked(res.liked);
          setCount(res.count);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  return (
    <div className="flex flex-col w-10">
      <div
        className="h-10 rounded-full ring-1 ring-gray-300 flex items-center justify-center hover:cursor-pointer"
        onClick={handleButtonClick}
      >
        <HeartIcon className={clsx('w-6 h-6', liked ? 'text-red-400' : 'text-gray-300')} />
      </div>
      <div className="text-center font-bold text-gray-500">{count}</div>
    </div>
  );
}
