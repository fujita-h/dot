import { Editor, FloatingMenu } from '@tiptap/react';
import {
  ButtonBulletList,
  ButtonCodeBlock,
  ButtonHeading1,
  ButtonHeading2,
  ButtonHeading3,
  ButtonOrderedList,
  ButtonParagraph,
  ButtonTableInsert,
  ButtonTaskList,
} from '../buttons';

export function FloatingMenuNewLine({ editor }: { editor: Editor }) {
  return (
    <FloatingMenu
      pluginKey="newLineFloatingMenu"
      tippyOptions={{ duration: 200 }}
      editor={editor}
      shouldShow={({ editor, view, state, oldState }) => {
        const { selection } = state;
        const { $anchor, empty } = selection;
        const isRootDepth = $anchor.depth === 1;
        const isEmptyTextBlock =
          $anchor.parent.isTextblock && !$anchor.parent.type.spec.code && !$anchor.parent.textContent;
        if (!view.hasFocus() || !empty || !isRootDepth || !isEmptyTextBlock || !editor?.isEditable) {
          return false;
        }
        return true;
      }}
    >
      <div className="flex rounded-md text-2xl bg-white text-black px-2 py-1 ml-2 shadow-md shadow-gray-300 ring-inset ring-1 ring-gray-300">
        <ButtonParagraph editor={editor} id="fm-paragraph" prevButtonId={undefined} nextButtonId="fm-heading1" />
        <div className="border-l-2 border-gray-400/30 ml-1 pl-1"></div>
        <ButtonHeading1 editor={editor} id="fm-heading1" prevButtonId="fm-paragraph" nextButtonId="fm-heading2" />
        <ButtonHeading2 editor={editor} id="fm-heading2" prevButtonId="fm-heading1" nextButtonId="fm-heading3" />
        <ButtonHeading3 editor={editor} id="fm-heading3" prevButtonId="fm-heading2" nextButtonId="fm-bulletList" />
        <div className="border-l-2 border-gray-400/30 ml-2 pl-2"></div>
        <ButtonBulletList editor={editor} id="fm-bulletList" prevButtonId="fm-heading3" nextButtonId="fm-orderedList" />
        <ButtonOrderedList
          editor={editor}
          id="fm-orderedList"
          prevButtonId="fm-bulletList"
          nextButtonId="fm-taskList"
        />
        <ButtonTaskList editor={editor} id="fm-taskList" prevButtonId="fm-orderedList" nextButtonId="fm-table" />
        <div className="border-l-2 border-gray-400/30 ml-2 pl-2"></div>
        <ButtonTableInsert editor={editor} id="fm-table" prevButtonId="fm-taskList" nextButtonId="fm-codeBlock" />
        <div className="border-l-2 border-gray-400/30 ml-2 pl-2"></div>
        <ButtonCodeBlock editor={editor} id="fm-codeBlock" prevButtonId="fm-table" nextButtonId={undefined} />
      </div>
    </FloatingMenu>
  );
}
