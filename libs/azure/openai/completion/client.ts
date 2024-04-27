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

  async getTextCompletion(prompt: string, text: string, maxTokens = 100, temperature = 0.5, stop = ['。']) {
    if (process.env.AZURE_OPENAI_CHAT_COMPLETION_DEPLOYMENT) {
      return this.getChatCompletion(prompt, text, maxTokens, temperature, stop).then((res) => {
        return (
          res.choices[0].message?.content?.replace('\n', '') + (res.choices[0].finishReason === 'stop' ? '。' : '')
        );
      });
    }
    return this.getCompletion(prompt + text, maxTokens, temperature, stop).then((res) => {
      return res.choices[0].text?.replace('\n', '') + (res.choices[0].finishReason === 'stop' ? '。' : '');
    });
  }

  private async getChatCompletion(prompt: string, text: string, maxTokens = 100, temperature = 0.5, stop = ['。']) {
    const deployment = process.env.AZURE_OPENAI_CHAT_COMPLETION_DEPLOYMENT;
    if (!deployment) {
      throw new Error('AZURE_OPENAI_CHAT_COMPLETION_DEPLOYMENT is not defined');
    }
    const messages = [
      { role: 'system', content: prompt },
      { role: 'user', content: text },
    ];
    return this.client.getChatCompletions(deployment, messages, { maxTokens, temperature, stop });
  }

  private async getCompletion(text: string, maxTokens = 100, temperature = 0.5, stop = ['。']) {
    const deployment = process.env.AZURE_OPENAI_COMPLETION_DEPLOYMENT;
    if (!deployment) {
      throw new Error('AZURE_OPENAI_COMPLETION_DEPLOYMENT is not defined');
    }
    return this.client.getCompletions(deployment, [text], { maxTokens, temperature, stop });
  }
}
