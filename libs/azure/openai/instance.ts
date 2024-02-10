import { OpenAIClient } from './client';

const openAIClientSingleton = () => {
  return new OpenAIClient();
};

declare global {
  var openAI: undefined | ReturnType<typeof openAIClientSingleton>;
}

const openAI = globalThis.openAI ?? openAIClientSingleton();

export default openAI;

if (process.env.NODE_ENV !== 'production') globalThis.openAI = openAI;
