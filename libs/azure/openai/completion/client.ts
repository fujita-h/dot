import { AzureOpenAIClient } from '../client';
import OpenAI from 'openai';
export class AzureOpenAICompletionClient extends AzureOpenAIClient {
  constructor() {
    const endpoint = process.env.AZURE_OPENAI_COMPLETION_ENDPOINT || undefined;
    const key = process.env.AZURE_OPENAI_COMPLETION_KEY || undefined;
    const version = process.env.AZURE_OPENAI_COMPLETION_API_VERSION || undefined;
    const deployment = process.env.AZURE_OPENAI_COMPLETION_DEPLOYMENT || undefined;

    if (!endpoint) {
      throw new Error('AZURE_OPENAI_COMPLETION_ENDPOINT is not defined');
    }
    if (!key) {
      throw new Error('AZURE_OPENAI_COMPLETION_KEY is not defined');
    }
    if (!version) {
      throw new Error('AZURE_OPENAI_COMPLETION_API_VERSION is not defined');
    }
    if (!deployment) {
      throw new Error('AZURE_OPENAI_COMPLETION_DEPLOYMENT is not defined');
    }
    super(endpoint, key, version, deployment);
  }

  async getTextCompletion(prompt: string, text: string, maxTokens = 100, temperature = 0.5, stop = ['。']) {
    return this.getChatCompletion(prompt, text, maxTokens, temperature, stop).then((res) => {
      return res.choices[0].message?.content?.replace('\n', '') + (res.choices[0].finish_reason === 'stop' ? '。' : '');
    });
  }

  private async getChatCompletion(prompt: string, text: string, max_tokens = 100, temperature = 0.5, stop = ['。']) {
    const systemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = { role: 'system', content: prompt };
    const userMessage: OpenAI.Chat.ChatCompletionUserMessageParam = { role: 'user', content: text };
    const messages = [systemMessage, userMessage];
    return this.client.chat.completions.create({ messages: messages, model: '', temperature, max_tokens, stop });
  }
}
