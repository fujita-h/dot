import Link from 'next/link';

export function SimplePagination({
  page,
  lastPage,
  href = '',
  searchParams = new URLSearchParams(),
}: {
  page: number;
  lastPage: number;
  href?: string;
  searchParams?: URLSearchParams;
}) {
  const prevParams = new URLSearchParams(searchParams);
  prevParams.set('page', (page - 1).toString());
  const prevHref = `${href}?${prevParams.toString()}`;

  const nextParams = new URLSearchParams(searchParams);
  nextParams.set('page', (page + 1).toString());
  const nextHref = `${href}?${nextParams.toString()}`;

  return (
    <div className="flex justify-between">
      <div className="flex-1">
        {page > 1 && (
          <Link href={prevHref}>
            <span className="text-sm font-noto-sans-jp font-semibold text-gray-500 hover:text-gray-700 hover:underline">
              前へ
            </span>
          </Link>
        )}
      </div>
      <div className="flex-1 text-center">
        <span className="text-xs font-semibold text-gray-500">
          {page} / {lastPage}
        </span>
      </div>
      <div className="flex-1 text-right">
        {page < lastPage && (
          <Link href={nextHref}>
            <span className="text-sm font-noto-sans-jp font-semibold text-gray-500 hover:text-gray-700 hover:underline">
              次へ
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
