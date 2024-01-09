import { Editor } from '@tiptap/react';
import {
  ButtonSelectText,
  ButtonBold,
  ButtonItalic,
  ButtonUnderline,
  ButtonStrike,
  ButtonCode,
  ButtonTableInsert,
} from '../buttons';

export function StickyMenu({ editor }: { editor: Editor }) {
  return (
    <div className="bg-gray-100 sticky top-0 left-0 z-10 pt-2">
      <div className="bg-white p-2 border rounded-t-md border-gray-300">
        <div className="flex text-2xl">
          <ButtonSelectText editor={editor} id="button-textMenu" prevButtonId={undefined} nextButtonId="button-bold" />
          <div className="border-l-2 border-gray-400/30 ml-2 pl-1"></div>
          <ButtonBold editor={editor} id="button-bold" prevButtonId="button-textMenu" nextButtonId="button-italic" />
          <ButtonItalic editor={editor} id="button-italic" prevButtonId="button-bold" nextButtonId="button-underline" />
          <ButtonUnderline
            editor={editor}
            id="button-underline"
            prevButtonId="button-italic"
            nextButtonId="button-strike"
          />
          <ButtonStrike editor={editor} id="button-strike" prevButtonId="button-underline" nextButtonId="utton-code" />
          <ButtonCode editor={editor} id="button-code" prevButtonId="button-strike" nextButtonId="button-table" />
          <div className="border-l-2 border-gray-400/30 ml-2 pl-1"></div>
          <ButtonTableInsert editor={editor} id="button-table" prevButtonId="button-code" nextButtonId={undefined} />
        </div>
      </div>
    </div>
  );
}
