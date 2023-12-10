import clsx from 'clsx';
import Link from 'next/link';

type TabItem = {
  name: string;
  href: string;
  current: boolean;
};

export function SimpleTab({ tabs }: { tabs: TabItem[] }) {
  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px px-3 flex space-x-3" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={clsx(
                tab.current
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-4 pb-0.5 px-2 text-sm font-medium font-noto-sans-jp'
              )}
              aria-current={tab.current ? 'page' : undefined}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
