import { AzureOpenAIClient } from '../client';

export class AzureOpenAIEmbeddingClient extends AzureOpenAIClient {
  constructor() {
    const endpoint = process.env.AZURE_OPENAI_EMBEDDING_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || undefined;
    const key = process.env.AZURE_OPENAI_EMBEDDING_KEY || process.env.AZURE_OPENAI_KEY || undefined;
    if (!endpoint) {
      throw new Error('AZURE_OPENAI_EMBEDDING_ENDPOINT or AZURE_OPENAI_ENDPOINT is not defined');
    }
    if (!key) {
      throw new Error('AZURE_OPENAI_EMBEDDING_KEY or AZURE_OPENAI_KEY is not defined');
    }
    super(endpoint, key);
  }

  async getEmbedding(text: string) {
    const deployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT;
    if (!deployment) {
      throw new Error('AZURE_OPENAI_EMBEDDING_DEPLOYMENT is not defined');
    }
    return this.client.getEmbeddings(deployment, [text]);
  }
}
