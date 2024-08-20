import { AzureOpenAI } from 'openai';
export class AzureOpenAIClient {
  protected client: AzureOpenAI;

  constructor(endpoint: string, apiKey: string, apiVersion: string, deployment: string) {
    this.client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
  }
}
