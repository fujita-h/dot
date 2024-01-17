import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { all, createLowlight } from 'lowlight';
import { EditorWrapper, ViewerWrapper } from './content-wrapper';

const lowlight = createLowlight(all);

const CodeBlockLowlightExtension = CodeBlockLowlight.extend({
  addNodeView() {
    if (this.editor.isEditable) {
      return ReactNodeViewRenderer(EditorWrapper);
    } else {
      return ReactNodeViewRenderer(ViewerWrapper);
    }
  },
}).configure({
  lowlight,
});

export default CodeBlockLowlightExtension;
