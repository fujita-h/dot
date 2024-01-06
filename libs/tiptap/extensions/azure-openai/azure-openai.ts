import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { Plugin } from 'prosemirror-state';

const AzureOpenAIExtension = Extension.create({
  name: 'azureOpenAI',
  priority: 1000,
  addOptions: () => ({
    pluginKey: 'azureOpenAI',
    completionAttributeName: 'azure-openai-completion',
    tabCompletion: false,
    completionFunc: async (prompt: string) => '',
    types: ['paragraph'],
  }),
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          [this.options.completionAttributeName]: {
            default: null,
            renderHTML: (attributes) => {
              if (!attributes[this.options.completionAttributeName]) return {};
              return {
                [`data-${this.options.completionAttributeName}`]: attributes[this.options.completionAttributeName],
              };
            },
            parseHTML: (element) => element.getAttribute(`data-${this.options.completionAttributeName}`),
          },
        },
      },
    ];
  },
  addProseMirrorPlugins() {
    const { completionAttributeName, types } = this.options;
    return [
      new Plugin({
        key: new PluginKey(this.options.pluginKey),
        appendTransaction(transactions, oldState, newState) {
          const { tr } = newState;
          const curNode = newState.selection.$from.node(newState.selection.$from.depth);
          const oldPos = oldState.selection.$from.pos;
          const curPos = newState.selection.$from.pos;

          // delete completion attribute from all nodes when cursor is moved
          newState.doc.descendants((node, pos) => {
            // if node is not target type, skip it.
            if (!types.includes(node.type.name)) return;

            // if node is current node and position is not changed, skip it.
            // (this is for tab completion)
            if (curNode.eq(node) && oldPos === curPos) return;

            // if node has completion attribute, remove it.
            if (node.attrs[completionAttributeName]) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                [completionAttributeName]: undefined,
              });
            }
          });
          return tr;
        },
        props: {
          handleKeyDown: (view, event) => {
            const { state } = view;
            const { doc, tr, selection } = state;
            const { $from, from, to } = selection;
            const node = $from.node($from.depth);

            // if tab completion is disabled, skip it.
            if (!this.options.tabCompletion) return false;
            // if node is not target type, skip it.
            if (!this.options.types.includes(node.type.name)) return false;

            if (event.key === 'Tab') {
              const attrs = node.attrs;

              // if node has completion attribute, insert it.
              if (node.attrs[this.options.completionAttributeName]) {
                const lineEnd = doc.resolve(from).end();
                if (from === lineEnd) {
                  let transaction = tr;
                  const suggestion = node.attrs[this.options.completionAttributeName];
                  transaction = transaction.setNodeMarkup($from.before($from.depth), undefined, {
                    ...node.attrs,
                    [this.options.completionAttributeName]: undefined,
                  });
                  transaction = transaction.insertText(suggestion, from, to);
                  view.dispatch(transaction);
                  event.preventDefault();
                  return true;
                }
              }

              if (from === to) {
                const lineStart = doc.resolve(from).start();
                const lineEnd = doc.resolve(from).end();
                const content = doc.textBetween(lineStart, lineEnd);

                // if line is empty, skip it.
                // some function uses Tab key on empty line. e.g. indent
                if (content.length == 0) return false;

                if (from === lineEnd) {
                  let prompt = '';
                  const texts: string[] = [];
                  state.doc.nodesBetween(0, from, (node, pos) => {
                    if (node.isTextblock) {
                      texts.push(node.textContent);
                    }
                  });
                  for (const text of texts.reverse()) {
                    if (prompt.length + text.length <= 600) {
                      prompt = text + '\n' + prompt;
                    } else {
                      break;
                    }
                  }

                  this.options
                    .completionFunc(prompt)
                    .then((suggestion) => {
                      view.dispatch(
                        tr.setNodeMarkup($from.before($from.depth), undefined, {
                          ...attrs,
                          [this.options.completionAttributeName]: suggestion,
                        })
                      );
                    })
                    .catch((e) => {
                      console.error(e);
                    });
                  event.preventDefault();
                  return true;
                }
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});

export default AzureOpenAIExtension;
