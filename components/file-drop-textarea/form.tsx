'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFiles } from './actions';
import styles from './styles.module.css';

export function FileDropTextarea({ defaultValue }: { defaultValue?: string }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectionPosition, setSelectionPosition] = useState(0);
  const [body, setBody] = useState(defaultValue || '');
  const [isPending, startTransition] = useTransition();
  const [uploadCounter, setUploadCounter] = useState({ count: 0, nextTextareaIndex: 0 });

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.setSelectionRange(uploadCounter.nextTextareaIndex, uploadCounter.nextTextareaIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadCounter.count]);

  const handleUploadFiles = async (files: File[]) => {
    return Promise.all(files.map((file) => file2DataUrl(file)))
      .then((results) => uploadFiles(results))
      .then((response) => {
        const fulfilled = response.filter((r) => r.status === 'fulfilled');
        const rejected = response.filter((r) => r.status === 'rejected');
        if (fulfilled.length > 0) {
          // text to insert
          const text = fulfilled.map((r: any) => `![${r.value.fileName}](/api/blobs/${r.value.blobName})\n`).join();
          // position to insert
          const lineStartIndex = findNumberOrNextClosest(findLineStartIndices(body), selectionPosition) || body.length;
          // insert text and update selection position
          setBody(body.substring(0, lineStartIndex) + text + body.substring(lineStartIndex));
          setSelectionPosition(lineStartIndex + text.length);
          // increment counter to trigger useEffect
          setUploadCounter({ count: uploadCounter.count + 1, nextTextareaIndex: lineStartIndex + text.length });
        }
      });
  };

  // Dropzone handler
  const onDrop = async (acceptedFiles: File[]) => startTransition(() => handleUploadFiles(acceptedFiles));
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      className="relative w-full h-full"
      {...getRootProps({
        onClick: (e) => {
          e.stopPropagation();
        },
      })}
    >
      <input {...getInputProps()} />
      <textarea
        ref={textareaRef}
        className={clsx(
          styles.thinScrollbar,
          'resize-none block w-full h-full rounded-md border-0 py-1.5 scroll-p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-400 sm:text-sm sm:leading-6'
        )}
        placeholder="Write something..."
        name="body"
        value={body}
        onKeyUp={(e) => {
          setSelectionPosition(e.currentTarget.selectionStart);
        }}
        onClick={(e) => {
          setSelectionPosition(e.currentTarget.selectionStart);
        }}
        onChange={(e) => {
          setBody(e.target.value);
          setSelectionPosition(e.currentTarget.selectionStart);
        }}
        onPaste={(e) => {
          startTransition(async () => {
            // Get the data of clipboard
            const clipboardItems = e.clipboardData.items;
            const items = [].slice.call(clipboardItems).filter(function (item: any) {
              // Filter the image items only
              return item.type.indexOf('image') !== -1;
            });
            if (items.length === 0) {
              return;
            }
            // upload files
            const files: File[] = items.map((item: any) => item.getAsFile());
            return handleUploadFiles(files);
          });
        }}
      />
      {isPending && (
        <div className="absolute top-0 left-0 z-[2] flex items-center justify-center bg-white w-full h-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300">
          <div>Uploading....</div>
        </div>
      )}
      {isDragActive && (
        <div className="absolute top-0 left-0 z-[2] flex items-center justify-center bg-white w-full h-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300">
          <div>Drop the files here ...</div>
        </div>
      )}
    </div>
  );
}

/**
 * Convert File to DataUrl
 *
 * @param file File object
 * @returns Promise of { fileName: string; data: string }
 */
function file2DataUrl(file: File) {
  return new Promise<{ fileName: string; data: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ fileName: file.name, data: reader.result as string });
    };
    reader.onerror = () => {
      reject();
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Get the start index of each line
 *
 * @param text multi-line text
 * @returns array of each line's start index
 */
function findLineStartIndices(text: string) {
  const lines = text.split(/\r?\n/);
  let startIndex = 0;
  let indices = [];

  for (let i = 0; i < lines.length; i++) {
    indices.push(startIndex);
    // The start position of the next line is the length of the current line + the number of line breaks
    // (1 for Unix systems, 2 for Windows)
    startIndex += lines[i].length + (text.includes('\r\n') ? 2 : 1);
  }

  return indices;
}

/**
 * Find the next closest number in the array
 *
 * @param indicesArray array of each line's start index
 * @param target search target
 * @returns next closest number or null
 */
function findNumberOrNextClosest(indicesArray: number[], target: number) {
  if (indicesArray.length === 0) {
    return null; // return null if the array is empty
  }

  let left = 0;
  let right = indicesArray.length - 1;

  // if the last element is smaller than the target, there is no number greater than the last element
  if (indicesArray[right] < target) {
    return indicesArray[right];
  }

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);

    if (indicesArray[mid] === target) {
      return indicesArray[mid]; // if the target is found, return it
    } else if (indicesArray[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // when exiting the loop, left is greater than the specified number and points to the closest value
  return indicesArray[left];
}
