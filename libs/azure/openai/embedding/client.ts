import { AzureOpenAIClient } from '../client';

export class AzureOpenAIEmbeddingClient extends AzureOpenAIClient {
  private _deployment: string;

  constructor() {
    const endpoint = process.env.AZURE_OPENAI_EMBEDDING_ENDPOINT || undefined;
    const key = process.env.AZURE_OPENAI_EMBEDDING_KEY || undefined;
    const version = process.env.AZURE_OPENAI_EMBEDDING_API_VERSION || undefined;
    const deployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || undefined;

    if (!endpoint) {
      throw new Error('AZURE_OPENAI_EMBEDDING_ENDPOINT is not defined');
    }
    if (!key) {
      throw new Error('AZURE_OPENAI_EMBEDDING_KEY is not defined');
    }
    if (!version) {
      throw new Error('AZURE_OPENAI_EMBEDDING_API_VERSION is not defined');
    }
    if (!deployment) {
      throw new Error('AZURE_OPENAI_EMBEDDING_DEPLOYMENT is not defined');
    }
    super(endpoint, key, version, deployment);
    this._deployment = deployment;
  }

  async getEmbedding(input: string) {
    return this.client.embeddings.create({ input, model: '' });
  }

  get deployment() {
    return this._deployment;
  }
}
