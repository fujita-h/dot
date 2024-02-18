import Blockquote from '@tiptap/extension-blockquote';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { EditorWrapper, ViewerWrapper } from './content-wrapper';

const HighlightBlockquoteExtension = Blockquote.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: null,
      },
    };
  },
  addOptions() {
    return {
      ...this.parent?.(),
      types: ['note', 'tip', 'important', 'warning', 'caution'],
    };
  },
  addNodeView() {
    if (this.editor.isEditable) {
      return ReactNodeViewRenderer(EditorWrapper);
    } else {
      return ReactNodeViewRenderer(ViewerWrapper);
    }
  },
});

export default HighlightBlockquoteExtension;
