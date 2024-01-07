import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';

const ImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const editable = this.editor?.isEditable ? true : false;
    const width = node.attrs.width ? `${node.attrs.width}%` : undefined;
    if (editable) {
      return [
        'div',
        { style: `width: ${width}; max-width: 100%;` },
        ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { width: undefined })],
      ];
    } else {
      return [
        'div',
        { style: `width: ${width}; max-width: 100%;` },
        [
          'a',
          {
            href: node.attrs.src,
            class: 'note-image-anchor',
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { width: undefined })],
        ],
      ];
    }
  },
});

export default ImageExtension;
