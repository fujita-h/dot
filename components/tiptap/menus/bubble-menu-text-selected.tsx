import { TextSelection } from '@tiptap/pm/state';
import { CellSelection } from '@tiptap/pm/tables';
import { BubbleMenu, Editor } from '@tiptap/react';
import {
  ButtonBold,
  ButtonCode,
  ButtonItalic,
  ButtonLink,
  ButtonSelectText,
  ButtonStrike,
  ButtonUnderline,
} from '../buttons';

export function BubbleMenuTextSelected({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      pluginKey="bm"
      tippyOptions={{ duration: 200, placement: 'top-start', maxWidth: 'none' }}
      editor={editor}
      shouldShow={({ editor, view, state, oldState, from, to }) => {
        if (editor.isActive('image')) return false;

        const { doc, selection } = state;
        const { empty } = selection;
        const isCellSelected = state.selection instanceof CellSelection;
        const isEmptyTextBlock = !doc.textBetween(from, to).length && state.selection instanceof TextSelection;
        const hasEditorFocus = view.hasFocus();

        if (!hasEditorFocus || !editor.isEditable) return false;
        if (isCellSelected) return false;

        if (!empty && !isEmptyTextBlock) {
          return true;
        }
        return false;
      }}
    >
      <div className="flex rounded-md text-2xl bg-white text-black px-2 py-1 shadow-md shadow-gray-300 ring-inset ring-1 ring-gray-300">
        <ButtonSelectText editor={editor} id="bm-textMenu" prevButtonId={undefined} nextButtonId="bm-bold" />
        <div className="border-l-2 border-gray-400/30 ml-1 pl-1"></div>
        <ButtonBold editor={editor} id="bm-bold" prevButtonId="bm-textMenu" nextButtonId="bm-italic" />
        <ButtonItalic editor={editor} id="bm-italic" prevButtonId="bm-bold" nextButtonId="bm-underline" />
        <ButtonUnderline editor={editor} id="bm-underline" prevButtonId="bm-italic" nextButtonId="bm-strike" />
        <ButtonStrike editor={editor} id="bm-strike" prevButtonId="bm-underline" nextButtonId="bm-code" />
        <ButtonCode editor={editor} id="bm-code" prevButtonId="bm-strike" nextButtonId="bm-link" />
        <ButtonLink editor={editor} id="bm-link" prevButtonId="bm-code" nextButtonId={undefined} />
      </div>
    </BubbleMenu>
  );
}
