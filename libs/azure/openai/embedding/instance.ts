import { AzureOpenAIEmbeddingClient } from './client';

const openAIEmbeddingClientSingleton = () => {
  return new AzureOpenAIEmbeddingClient();
};

declare global {
  var openAIEmbedding: undefined | ReturnType<typeof openAIEmbeddingClientSingleton>;
}

const openAIEmbedding = globalThis.openAIEmbedding ?? openAIEmbeddingClientSingleton();

export default openAIEmbedding;

if (process.env.NODE_ENV !== 'production') globalThis.openAIEmbedding = openAIEmbedding;
