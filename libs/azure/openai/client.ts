import { OpenAIClient as AzureOpenAIClient, AzureKeyCredential } from '@azure/openai';

export class OpenAIClient {
  private client: AzureOpenAIClient;

  constructor() {
    const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
    const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
    if (!AZURE_OPENAI_ENDPOINT) {
      throw new Error('AZURE_OPENAI_ENDPOINT is not defined');
    }
    if (!AZURE_OPENAI_KEY) {
      throw new Error('AZURE_OPENAI_KEY is not defined');
    }

    this.client = new AzureOpenAIClient(AZURE_OPENAI_ENDPOINT, new AzureKeyCredential(AZURE_OPENAI_KEY));
  }

  async getEmbedding(text: string) {
    const deployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT;
    if (!deployment) {
      throw new Error('AZURE_OPENAI_EMBEDDING_DEPLOYMENT is not defined');
    }
    return this.client.getEmbeddings(deployment, [text]);
  }
}
