import { AzureOpenAIClient } from '../client';

export class AzureOpenAIEmbeddingClient extends AzureOpenAIClient {
  private _deployment: string;

  constructor() {
    const endpoint = process.env.AZURE_OPENAI_EMBEDDING_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || undefined;
    const key = process.env.AZURE_OPENAI_EMBEDDING_KEY || process.env.AZURE_OPENAI_KEY || undefined;
    if (!endpoint) {
      throw new Error('AZURE_OPENAI_EMBEDDING_ENDPOINT or AZURE_OPENAI_ENDPOINT is not defined');
    }
    if (!key) {
      throw new Error('AZURE_OPENAI_EMBEDDING_KEY or AZURE_OPENAI_KEY is not defined');
    }
    if (!process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT) {
      throw new Error('AZURE_OPENAI_EMBEDDING_DEPLOYMENT is not defined');
    }
    super(endpoint, key);
    this._deployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT;
  }

  async getEmbedding(text: string) {
    return this.client.getEmbeddings(this._deployment, [text]);
  }

  get deployment() {
    return this._deployment;
  }
}
