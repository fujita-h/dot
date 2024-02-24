import { AzureOpenAIClient } from '../client';

export class AzureOpenAICompletionClient extends AzureOpenAIClient {
  constructor() {
    const endpoint = process.env.AZURE_OPENAI_COMPLETION_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || undefined;
    const key = process.env.AZURE_OPENAI_COMPLETION_KEY || process.env.AZURE_OPENAI_KEY || undefined;
    if (!endpoint) {
      throw new Error('AZURE_OPENAI_COMPLETION_ENDPOINT or AZURE_OPENAI_ENDPOINT is not defined');
    }
    if (!key) {
      throw new Error('AZURE_OPENAI_COMPLETION_KEY or AZURE_OPENAI_KEY is not defined');
    }
    super(endpoint, key);
  }

  async getCompletion(text: string, maxTokens = 100, temperature = 0.5, stop = ['\n']) {
    const deployment = process.env.AZURE_OPENAI_COMPLETION_DEPLOYMENT;
    if (!deployment) {
      throw new Error('AZURE_OPENAI_COMPLETION_DEPLOYMENT is not defined');
    }
    return this.client.getCompletions(deployment, [text], { maxTokens, temperature, stop });
  }
}
