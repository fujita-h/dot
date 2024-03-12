import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { Plugin } from 'prosemirror-state';
import { init as initCuid } from '@paralleldrive/cuid2';

const UniqueIdExtension = Extension.create({
  name: 'uniqueID',
  priority: 1000,
  addOptions: () => ({
    pluginKey: 'uniqueID',
    uniqueIDAttributeName: 'unique-id',
    types: ['heading'],
    createUniqueIdFunc: initCuid({ length: 12 }),
    readOnly: false,
  }),
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          [this.options.uniqueIDAttributeName]: {
            default: null,
            renderHTML: (attributes) => {
              if (!attributes[this.options.uniqueIDAttributeName]) return {};
              return {
                [`data-${this.options.uniqueIDAttributeName}`]: attributes[this.options.uniqueIDAttributeName],
              };
            },
            parseHTML: (element) => element.getAttribute(`data-${this.options.uniqueIDAttributeName}`),
          },
        },
      },
    ];
  },
  addProseMirrorPlugins() {
    const { uniqueIDAttributeName, types, readOnly, createUniqueIdFunc } = this.options;
    return [
      new Plugin({
        key: new PluginKey(this.options.pluginKey),
        appendTransaction(transactions, oldState, newState) {
          if (readOnly) return null;
          const currentNode = newState.selection.$from.node(newState.selection.$from.depth);

          // check if cursor is the target type
          if (types.includes(currentNode.type.name)) {
            let tr = newState.tr;
            // search all nodes
            newState.doc.descendants((node, pos) => {
              // if node is not target type, skip it.
              if (!types.includes(node.type.name)) return;
              // if node has no uniqueID attribute, set it.
              if (!node.attrs[uniqueIDAttributeName]) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  [uniqueIDAttributeName]: createUniqueIdFunc(),
                });
              }
            });
            // if no changes, return null
            if (!tr.steps.length) return null;
            // return transaction
            return tr;
          }
          // if cursor is not the target type, return null
          return null;
        },
      }),
    ];
  },
});

export default UniqueIdExtension;
