import { mergeAttributes } from '@tiptap/core';
import Image from '@tiptap/extension-image';

const ImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
      },
      width: {
        default: null,
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const editable = this.editor?.isEditable ? true : false;
    const caption = node.attrs.caption ? node.attrs.caption : '';
    const width = node.attrs.width ? `${node.attrs.width}%` : undefined;
    if (editable) {
      return [
        'div',
        { class: 'image-container' },
        [
          'div',
          { class: 'image-wrapper', style: `width: ${width}; max-width: 100%;` },
          ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { width: undefined })],
        ],
        ['p', { class: 'image-caption' }, caption],
      ];
    } else {
      return [
        'div',
        { class: 'image-container' },
        [
          'div',
          { class: 'image-wrapper', style: `width: ${width}; max-width: 100%;` },
          [
            'a',
            {
              href: node.attrs.src,
              class: 'image-anchor',
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { width: undefined })],
          ],
        ],
        ['p', { class: 'image-caption' }, caption],
      ];
    }
  },
});

export default ImageExtension;
