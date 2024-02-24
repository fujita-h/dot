'use client';

import { EDITOR_AI_COMPLETION_PROMPT } from '@/libs/constants';
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
  editorShowNewLineFloatingMenu: boolean;
  editorAiCompletionPrompt: string | null;
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
            <div className="mt-2 ml-4">
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="checkbox-show-new-line-floating-menu"
                    aria-describedby="checkbox-show-new-line-floating-menu-description"
                    name="editorShowNewLineFloatingMenu"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    value="true"
                    defaultChecked={props.editorShowNewLineFloatingMenu}
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="checkbox-show-new-line-floating-menu" className="font-medium text-gray-900">
                    フローティングメニューの表示
                  </label>
                  <p id="checkbox-show-new-line-floating-menu-description" className="text-gray-500">
                    新しい行を追加するときに表示されるメニューを表示します。
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-full">
            <label htmlFor="name" className="block text-base font-medium leading-6 text-gray-900">
              AIによる文章生成
            </label>
            <div className="mt-2 ml-4">
              <div className="relative flex items-start">
                <div className="flex-1 ml-3 text-sm leading-6">
                  <label htmlFor="textarea-ai-completion-prompt" className="font-medium text-gray-900">
                    文章生成プロンプトのカスタマイズ
                  </label>
                  <div className="mt-0.5">
                    <textarea
                      id="textarea-ai-completion-prompt"
                      name="editorAiCompletionPrompt"
                      rows={3}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      defaultValue={props.editorAiCompletionPrompt || ''}
                      placeholder={EDITOR_AI_COMPLETION_PROMPT}
                    />
                  </div>
                  <p className="text-gray-500">
                    このプロンプトに続いて入力した文章が追加され、AIによる文章生成が行われます。
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
