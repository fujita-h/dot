import { useEffect, useState } from 'react';

export function InputLinkFrom({ href, onUpdate }: { href: string; onUpdate: (href: string) => void }) {
  const [inputValue, setInputValue] = useState(href);
  useEffect(() => {
    setInputValue(href);
  }, [href]);

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-2 flex gap-1">
      <input
        type="text"
        className="text-sm rounded-md w-96 border-gray-300"
        placeholder="Enter link URL"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <div className="flex-none">
        <button
          type="button"
          className="text-sm rounded-md bg-gray-600 hover:bg-gray-500 text-white px-2 py-2"
          onClick={() => {
            onUpdate(inputValue);
          }}
        >
          <span>Set Link</span>
        </button>
      </div>
    </div>
  );
}
