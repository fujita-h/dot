import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { Plugin } from 'prosemirror-state';
import type { FileParam, UploadResult } from './types';

const UploadImageExtension = Extension.create({
  name: 'uploadImage',
  priority: 1000,
  addOptions: () => ({
    pluginKey: 'uploadImage',
    uploadImageFunc: async (fileParams: FileParam[]): Promise<PromiseSettledResult<UploadResult>[]> => [],
  }),
  addProseMirrorPlugins() {
    const { uploadImageFunc } = this.options;
    return [
      new Plugin({
        key: new PluginKey(this.options.pluginKey),
        props: {
          handleDOMEvents: {
            // Although it is possible to insert an image into a document without implementing the drop event,
            // the source of the image becomes the URL from which it is pasted, resulting in a cross-site request.
            // Therefore, override it to upload the image to your own site.
            drop(view, event) {
              // Check if the event contains files
              const hasFiles = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length;
              if (!hasFiles) {
                return;
              }

              // Check if these files are images
              const images = Array.from(event.dataTransfer.files).filter((file) => /image/i.test(file.type));
              if (images.length === 0) {
                return;
              }

              // Prevent default behavior
              event.preventDefault();

              // Get the coordinates of the drop point
              const { schema } = view.state;
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              // If the coordinates are not inside the document, do nothing
              if (!coordinates) {
                return;
              }

              // Upload images and insert image nodes
              Promise.all(images.map((file) => file2DataUrl(file)))
                .then((files) => {
                  return uploadImageFunc(files);
                })
                .then((results) => {
                  results.forEach((result) => {
                    if (result.status !== 'fulfilled') return;
                    const node = schema.nodes.image.create({
                      src: `/api/blobs/${result.value.blobName}`,
                    });
                    const transaction = view.state.tr.insert(coordinates.pos, node);
                    view.dispatch(transaction);
                  });
                });
            },
            paste(view, event) {
              // Check if the event contains files
              const hasFiles = event.clipboardData && event.clipboardData.files && event.clipboardData.files.length;
              if (!hasFiles) {
                return;
              }

              // Check if these files are images
              const images = Array.from(event.clipboardData.files).filter((file) => /image/i.test(file.type));
              if (images.length === 0) {
                return;
              }

              // Prevent default behavior
              event.preventDefault();

              // Get schema
              const { schema } = view.state;

              // Upload images and insert image nodes
              Promise.all(images.map((file) => file2DataUrl(file)))
                .then((files) => {
                  return uploadImageFunc(files);
                })
                .then((results) => {
                  // Check results. If all promises are rejected, do nothing.
                  if (results.filter((result) => result.status === 'fulfilled').length == 0) {
                    view.dispatch(view.state.tr);
                    return;
                  }

                  // Get transaction
                  let transaction = view.state.tr;

                  // if the selection exists, delete the selection
                  transaction = transaction.deleteSelection();

                  // insert image nodes
                  results.forEach((result) => {
                    if (result.status !== 'fulfilled') return;
                    const node = schema.nodes.image.create({
                      src: `/api/blobs/${result.value.blobName}`,
                    });
                    transaction = transaction.insert(transaction.selection.from, node);
                  });

                  // delete the node of current cursor if it is empty
                  const { $from } = view.state.selection;
                  const start = $from.start($from.depth);
                  const end = $from.end($from.depth);
                  const node = $from.node($from.depth);
                  const isEmptyNode = node.content.size === 0;
                  if (isEmptyNode) {
                    transaction = transaction.delete(start - 1, end + 1);
                  }

                  // run transaction
                  view.dispatch(transaction);
                });
            },
          },
        },
      }),
    ];
  },
});

/**
 * Convert File to DataUrl
 *
 * @param file File object
 * @returns Promise of { fileName: string; fileDataURL: string }
 */
function file2DataUrl(file: File) {
  return new Promise<{ fileName: string; fileDataURL: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ fileName: file.name, fileDataURL: reader.result as string });
    };
    reader.onerror = () => {
      reject();
    };
    reader.readAsDataURL(file);
  });
}

export default UploadImageExtension;
