'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function SearchForm({ q }: { q?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  useEffect(() => {
    setQuery(q);
  }, [q]);
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <form
        action={(e) => {
          const query = e.get('search');
          if (query) {
            router.push(`/search?q=${query}`);
          } else {
            router.push(`/search`);
          }
        }}
      >
        <input
          type="search"
          name="search"
          className="block w-full rounded-md border-0 bg-white py-3 pl-10 pr-3 text-gray-900 ring-0 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          autoComplete="off"
        />
      </form>
    </div>
  );
}
