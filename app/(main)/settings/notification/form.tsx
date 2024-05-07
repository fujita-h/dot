'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
import { ActionState, updateUserSettingAction } from './action';

import 'react-toastify/dist/ReactToastify.css';

const initialActionState: ActionState = {
  status: null,
  target: null,
  message: null,
  lastModified: 0,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      Save
    </button>
  );
}

interface Props {
  notificationOnCommentAdded: boolean;
  notificationOnCommentReplied: boolean;
}

export function Form({ props }: { props: Props }) {
  const [actionState, formAction] = useFormState(updateUserSettingAction, initialActionState);

  useEffect(() => {
    if (actionState.status === 'success') {
      toast.success(actionState.message);
    } else if (actionState.status === 'error') {
      toast.error(actionState.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionState.lastModified]);

  return (
    <form action={formAction}>
      <ToastContainer
        stacked={true}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        closeOnClick={true}
        draggable={false}
      />
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-3xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <label htmlFor="name" className="block text-base font-medium leading-6 text-gray-900">
              エディターの機能
            </label>
            <div className="mt-2 ml-4 space-y-3">
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="checkbox-notification-on-comment-added"
                    aria-describedby="checkbox-notification-on-comment-added-description"
                    name="notificationOnCommentAdded"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    value="true"
                    defaultChecked={props.notificationOnCommentAdded}
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="checkbox-notification-on-comment-added" className="font-medium text-gray-900">
                    投稿にコメントされたときに通知する
                  </label>
                  <p id="checkbox-notification-on-comment-added-description" className="text-gray-500">
                    あなたの投稿に対してコメントされたときに通知します。
                  </p>
                </div>
              </div>
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="checkbox-notification-on-comment-replied"
                    aria-describedby="checkbox-notification-on-comment-replied-description"
                    name="notificationOnCommentReplied"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    value="true"
                    defaultChecked={props.notificationOnCommentReplied}
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="checkbox-notification-on-comment-replied" className="font-medium text-gray-900">
                    コメントが追加されたときに通知する
                  </label>
                  <p id="checkbox-notification-on-comment-replied-description" className="text-gray-500">
                    あなたがコメントをした投稿に対して、他の人のコメントが追加されたときに通知します。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        <SubmitButton />
      </div>
    </form>
  );
}
