import { AzureOpenAICompletionClient } from './client';

const openAICompletionClientSingleton = () => {
  return new AzureOpenAICompletionClient();
};

declare global {
  var openAICompletion: undefined | ReturnType<typeof openAICompletionClientSingleton>;
}

const openAICompletion = globalThis.openAICompletion ?? openAICompletionClientSingleton();

export default openAICompletion;

if (process.env.NODE_ENV !== 'production') globalThis.openAICompletion = openAICompletion;
