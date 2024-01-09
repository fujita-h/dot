import { TextSelection } from '@tiptap/pm/state';
import { CellSelection } from '@tiptap/pm/tables';
import { BubbleMenu, Editor } from '@tiptap/react';
import {
  ButtonHeaderCol,
  ButtonHeaderRow,
  ButtonTableColAddAfter,
  ButtonTableColAddBefore,
  ButtonTableColDelete,
  ButtonTableDelete,
  ButtonTableMerge,
  ButtonTableRowAddAfter,
  ButtonTableRowAddBefore,
  ButtonTableRowDelete,
  ButtonTableSplit,
} from '../buttons';

export function BubbleMenuTable({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      pluginKey="table-bm"
      tippyOptions={{
        duration: 100,
        placement: 'top-start',
        maxWidth: 'none',
        getReferenceClientRect: () => {
          let data = {
            width: 0,
            height: 0,
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            x: 0,
            y: 0,
          };

          if (!editor.isActive('table')) {
            return {
              ...data,
              toJSON: () => data,
            };
          }

          const { view } = editor;
          const { from } = view.state.selection;
          const dom = view.domAtPos(from);
          const element = dom.node.parentNode as HTMLElement;
          const wrapperElement = findParentElementByClassRecursive(element, 'tableWrapper');
          const wrapperRect = wrapperElement?.getBoundingClientRect();
          if (!wrapperRect) {
            return {
              ...data,
              toJSON: () => data,
            };
          }
          return {
            ...data,
            width: wrapperRect.width,
            height: wrapperRect.height,
            top: wrapperRect.top,
            bottom: wrapperRect.bottom,
            left: wrapperRect.left,
            right: wrapperRect.right,
            x: wrapperRect.x,
            y: wrapperRect.y,
            toJSON: () => data,
          };
        },
      }}
      editor={editor}
      shouldShow={({ editor, view, state, oldState, from, to }) => {
        if (!editor.isActive('table')) return false;

        // original shouldShow function
        const { doc, selection } = state;
        const { empty } = selection;
        const hasEditorFocus = view.hasFocus();
        const textLength = doc.textBetween(from, to).length;
        const textSelection = state.selection instanceof TextSelection;
        const cellSelection = state.selection instanceof CellSelection;
        const isEmptySelected = textLength == 0 && textSelection;
        const isTextSelected = textLength > 0 && textSelection;
        const isCellSelected = cellSelection;

        if (!hasEditorFocus || !editor.isEditable) return false;
        if (isCellSelected) return true;
        if (isEmptySelected) return true;
        if (isTextSelected) return false;

        return false;
      }}
    >
      <div className="flex rounded-md text-2xl bg-white text-black px-2 py-1 shadow-md shadow-gray-300 ring-inset ring-1 ring-gray-300">
        <ButtonHeaderRow
          editor={editor}
          id="table-bm-headerRow"
          prevButtonId={undefined}
          nextButtonId="table-bm-headerCol"
        />
        <ButtonHeaderCol
          editor={editor}
          id="table-bm-headerCol"
          prevButtonId="table-bm-headerRow"
          nextButtonId="table-bm-addRowBefore"
        />
        <div className="border-l-2 border-gray-400/30 ml-1 pl-1"></div>
        <ButtonTableRowAddBefore
          editor={editor}
          id="table-bm-addRowBefore"
          prevButtonId="table-bm-headerCol"
          nextButtonId="table-bm-addRowAfter"
        />
        <ButtonTableRowAddAfter
          editor={editor}
          id="table-bm-addRowAfter"
          prevButtonId="table-bm-addRowBefore"
          nextButtonId="table-bm-deleteRow"
        />
        <ButtonTableRowDelete
          editor={editor}
          id="table-bm-deleteRow"
          prevButtonId="table-bm-addRowAfter"
          nextButtonId="table-bm-addColBefore"
        />
        <div className="border-l-2 border-gray-400/30 ml-1 pl-1"></div>
        <ButtonTableColAddBefore
          editor={editor}
          id="table-bm-addColBefore"
          prevButtonId="table-bm-deleteRow"
          nextButtonId="table-bm-addColAfter"
        />
        <ButtonTableColAddAfter
          editor={editor}
          id="table-bm-addColAfter"
          prevButtonId="table-bm-addColBefore"
          nextButtonId="table-bm-deleteCol"
        />
        <ButtonTableColDelete
          editor={editor}
          id="table-bm-deleteCol"
          prevButtonId="table-bm-addColAfter"
          nextButtonId="table-bm-split"
        />
        <div className="border-l-2 border-gray-400/30 ml-1 pl-1"></div>
        <ButtonTableSplit
          editor={editor}
          id="table-bm-split"
          prevButtonId="table-bm-deleteCol"
          nextButtonId="table-bm-merge"
        />
        <ButtonTableMerge
          editor={editor}
          id="table-bm-merge"
          prevButtonId="table-bm-split"
          nextButtonId="table-bm-delete"
        />
        <div className="border-l-2 border-gray-400/30 ml-1 pl-1"></div>
        <ButtonTableDelete
          editor={editor}
          id="table-bm-delete"
          prevButtonId="table-bm-merge"
          nextButtonId={undefined}
        />
      </div>
    </BubbleMenu>
  );
}

function findParentElementByClassRecursive(element: HTMLElement | null, className: string): HTMLElement | null {
  // return null if element is null
  if (!element) {
    return null;
  }

  // check if element has the specified class
  if (element.classList.contains(className)) {
    return element;
  }

  // check if parentNode exists and is of type HTMLElement, if so call the function recursively
  const parent = element.parentNode;
  if (parent && parent instanceof HTMLElement) {
    return findParentElementByClassRecursive(parent, className);
  }

  // return null if no element with the specified class was found
  return null;
}
