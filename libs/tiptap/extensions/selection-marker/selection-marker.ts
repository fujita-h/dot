/* eslint-disable prettier/prettier */
import { Mark, mergeAttributes } from '@tiptap/react';
import { PluginKey } from '@tiptap/pm/state';
import { Plugin } from 'prosemirror-state';

export interface SelectionMarkerExtensionOptions {
  pluginKey: string,
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selection: {
      setSelectionMarker: () => ReturnType;
      toggleSelectionMarker: () => ReturnType;
      unsetSelectionMarker: () => ReturnType;
    };
  }
}

const SelectionMarkerExtension = Mark.create<SelectionMarkerExtensionOptions>({
  name: 'selection-marker',
  addOptions() {
    return {
      pluginKey: 'selection-marker',
      HTMLAttributes: {},
    }
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, this.options.HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setSelectionMarker: () => ({ commands }) => {
        return commands.setMark(this.name)
      },
      toggleSelectionMarker: () => ({ commands }) => {
        return commands.toggleMark(this.name)
      },
      unsetSelectionMarker: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey(this.options.pluginKey),
        appendTransaction(transactions, oldState, newState) {
          const oldSelection = oldState.selection
          const newSelection = newState.selection

          // if cursor is moved
          if (oldSelection.from !== newSelection.from || oldSelection.to !== newSelection.to) {
            // remove selection-marker from all nodes
            let tr = newState.tr
            newState.doc.descendants((node, pos) => {
              if (node.isText && node.marks.some(mark => mark.type.name === 'selection-marker')) {
                tr.removeMark(pos, pos + node.nodeSize, newState.schema.marks['selection-marker'])
              }
            })

            // return transaction if exists
            if (!tr.steps.length) return null
            return tr
          }
          return null;
        },
      })
    ];
  }
});

export default SelectionMarkerExtension;
