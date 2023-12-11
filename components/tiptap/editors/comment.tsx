'use client';

import '@/components/tiptap/tiptap.css';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function CommentEditor({
  noteId,
  postAction: post,
}: {
  noteId: string;
  postAction: (noteId: string, comment: string) => Promise<{ id: string }>;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({
        openOnClick: false,
      }),
      PlaceholderExtension.configure({
        placeholder: 'Write comment here...',
      }),
      UnderlineExtension,
    ],
  });

  return (
    <div>
      <EditorContent editor={editor} />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={async () => {
            const result = await post(noteId, JSON.stringify(editor?.getJSON())).catch((e) => null);
            if (result) {
              console.log(result);
              editor?.commands.clearContent();
            }
          }}
        >
          Post
        </button>
      </div>
    </div>
  );
}
