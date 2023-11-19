'use client';

import clsx from 'clsx';
import { setFollow } from './action';

export function FollowToggleButton({ id, isFollowing }: { id: string; isFollowing: boolean }) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-full focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-gray-500 hover:cursor-pointer',
        isFollowing ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      )}
      onClick={() => setFollow(id, !isFollowing)}
    >
      {isFollowing ? 'フォロー中' : 'フォロー'}
    </button>
  );
}
