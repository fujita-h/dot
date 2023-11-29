import Link from 'next/link';

export function TopicBadge({ topic }: { topic: { id: string; handle: string; name: string } }) {
  return (
    <div className="flex">
      <Link key={topic.id} href={`/topics/${topic.handle}`}>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white ring-1 shadow-sm ring-gray-300 rounded-md hover:bg-gray-50 hover:ring-indigo-300">
          <div className="flex-shrink-0">
            <img src={`/api/topics/${topic.id}/icon`} className="w-6 h-6 rounded-full" alt="topic icon" />
          </div>
          <div className="flex-none text-base text-gray-900">{topic.name}</div>
        </div>
      </Link>
    </div>
  );
}
