import { Editor, BubbleMenu } from '@tiptap/react';
import { useState, useEffect } from 'react';
import { RiEdit2Line, RiDeleteBin5Line } from 'react-icons/ri';
import { InputLinkFrom } from '../forms';

export function BubbleMenuLink({ editor }: { editor: Editor }) {
  const isLinkActive = editor.isActive('link');
  const href = editor.getAttributes('link').href || '';
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    // the isLinkActive value is updated means the move cursor or update link.
    // so, we need to set the showInput value default.
    if (!isLinkActive) {
      setShowInput(false);
    }
  }, [isLinkActive]);

  return (
    <BubbleMenu
      pluginKey="link-bm"
      tippyOptions={{ duration: 100, placement: 'bottom-start', maxWidth: 'none' }}
      editor={editor}
      shouldShow={({ editor, view, state, oldState, from, to }) => {
        if (!editor.isActive('link')) return false;

        const { selection } = state;
        const { empty } = selection;
        if (!empty) return false;

        return true;
      }}
    >
      <div hidden={showInput}>
        <div className="flex items-center max-w-96 divide-x divide-gray-300 rounded-md bg-white text-black px-2 py-1 shadow-md shadow-gray-300 ring-inset ring-1 ring-gray-300">
          <div className="flex-1 px-2">
            <span className="text-xs break-all">{href}</span>
          </div>
          <div className="flex-none px-2 space-x-3">
            <button
              type="button"
              className="text-2xl text-gray-600 p-1 rounded-md hover:bg-gray-200"
              onClick={() => {
                setShowInput(true);
              }}
            >
              <RiEdit2Line />
            </button>
            <button
              type="button"
              className="text-2xl text-gray-600 p-1 rounded-md hover:bg-gray-200"
              onClick={() => {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
              }}
            >
              <RiDeleteBin5Line />
            </button>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="absolute z-10 " hidden={!showInput}>
          <InputLinkFrom
            href={href}
            onUpdate={(href) => {
              editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
            }}
          />
        </div>
      </div>
    </BubbleMenu>
  );
}
