import { Editor, BubbleMenu } from '@tiptap/react';
import { useState, useEffect } from 'react';
export function BubbleMenuImage({ editor }: { editor: Editor }) {
  const caption = (editor.getAttributes('image').caption as string) ?? '';
  const width = (editor.getAttributes('image').width as string) ?? '100';

  const [captionText, setCaptionText] = useState(caption);
  const [widthText, setWidthText] = useState(width);

  useEffect(() => setCaptionText(caption), [caption]);
  useEffect(() => setWidthText(width), [width]);

  return (
    <BubbleMenu
      pluginKey="table-image"
      tippyOptions={{ duration: 200, placement: 'top-start', maxWidth: 'none' }}
      editor={editor}
      shouldShow={({ editor, view, state, oldState, from, to }) => {
        if (!editor.isActive('image')) return false;
        return true;
      }}
    >
      <div className="flex rounded-md text-2xl bg-white text-black px-2 py-1 shadow-md shadow-gray-300 ring-inset ring-1 ring-gray-300">
        <div className="my-auto">
          <div className="text-sm text-center mt-0.5 mb-[-8px]">
            <span className="mr-1">最大幅:</span>
            <span>{widthText}%</span>
          </div>
          <div>
            <input
              type="range"
              min="20"
              max="100"
              step="20"
              value={widthText}
              onChange={(e) => editor.chain().focus().updateAttributes('image', { width: e.target.value }).run()}
            />
          </div>
        </div>
        <div className="border-l-2 border-gray-400/30 ml-2 pl-2"></div>
        <div className="my-auto py-1">
          <div className="text-xs mb-[-4px]">キャプション</div>
          <div className="my-auto space-x-2">
            <input
              type="text"
              className="w-80 rounded-md text-xs px-2 py-1 border-gray-300"
              value={captionText}
              onChange={(e) => {
                setCaptionText(e.target.value);
              }}
            />
            <button
              type="button"
              className="text-sm text-gray-900 hover:text-gray-500"
              onClick={() => {
                editor.chain().focus().updateAttributes('image', { caption: captionText }).run();
              }}
            >
              save
            </button>
          </div>
        </div>
      </div>
    </BubbleMenu>
  );
}
