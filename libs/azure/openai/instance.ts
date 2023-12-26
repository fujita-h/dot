import { OpenAIClient } from './client';

const openAIClientSingleton = () => {
  return new OpenAIClient();
};

type OpenAIClientSingleton = ReturnType<typeof openAIClientSingleton>;

const globalForOpenAI = globalThis as unknown as {
  openAI: OpenAIClientSingleton | undefined;
};

const openAI = globalForOpenAI.openAI ?? openAIClientSingleton();

export default openAI;

if (process.env.NODE_ENV !== 'production') globalForOpenAI.openAI = openAI;
