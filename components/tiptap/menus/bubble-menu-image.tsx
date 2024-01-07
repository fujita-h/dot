import { Editor, BubbleMenu } from '@tiptap/react';

export function BubbleMenuImage({ editor }: { editor: Editor }) {
  const width = editor.getAttributes('image').width;
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
        <div>
          <div className="text-sm text-center mt-0.5 mb-[-8px]">
            <span className="mr-1">最大幅:</span>
            <span>{width ?? 100}%</span>
          </div>
          <div>
            <input
              type="range"
              min="20"
              max="100"
              step="20"
              value={width ?? 100}
              onChange={(e) => editor.chain().focus().updateAttributes('image', { width: e.target.value }).run()}
            />
          </div>
        </div>
      </div>
    </BubbleMenu>
  );
}
