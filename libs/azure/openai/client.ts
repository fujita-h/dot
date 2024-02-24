import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

export class AzureOpenAIClient {
  protected client: OpenAIClient;

  constructor(endpoint: string, key: string) {
    this.client = new OpenAIClient(endpoint, new AzureKeyCredential(key));
  }
}
