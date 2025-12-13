/**
 * OpenRouter AI Provider Implementation
 * https://openrouter.ai/docs
 */

import type {
  AIProviderInterface,
  ChatCompletionOptions,
  ChatCompletionResponse,
  StreamChunk,
  EmbeddingOptions,
  EmbeddingResponse,
  AIModel,
} from './types';
import { AI_MODELS } from './types';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export class OpenRouterProvider implements AIProviderInterface {
  private async makeRequest(
    endpoint: string,
    body: Record<string, unknown>,
    stream = false
  ): Promise<Response> {
    const response = await fetch(`${OPENROUTER_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'ShipKit',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    return response;
  }

  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const messages: OpenRouterMessage[] = options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await this.makeRequest('/chat/completions', {
      model: options.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      stream: false,
    });

    const data: OpenRouterResponse = await response.json();

    return {
      id: data.id,
      content: data.choices[0]?.message.content || '',
      model: data.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      finishReason: this.mapFinishReason(data.choices[0]?.finish_reason),
    };
  }

  async *chatStream(options: ChatCompletionOptions): AsyncIterable<StreamChunk> {
    const messages: OpenRouterMessage[] = options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await this.makeRequest('/chat/completions', {
      model: options.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      stream: true,
    });

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let requestId = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield { id: requestId, content: '', done: true };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              requestId = parsed.id || requestId;
              const content = parsed.choices?.[0]?.delta?.content || '';
              const finishReason = parsed.choices?.[0]?.finish_reason;

              if (content) {
                yield { id: requestId, content, done: false };
              }

              if (finishReason) {
                yield { id: requestId, content: '', done: true };
                return;
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async embed(options: EmbeddingOptions): Promise<EmbeddingResponse> {
    const input = Array.isArray(options.input) ? options.input : [options.input];

    const response = await this.makeRequest('/embeddings', {
      model: options.model || 'openai/text-embedding-3-small',
      input,
    });

    const data = await response.json();

    return {
      embeddings: data.data.map((d: { embedding: number[] }) => d.embedding),
      model: data.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  getModels(): AIModel[] {
    return AI_MODELS;
  }

  getModel(modelId: string): AIModel | undefined {
    return AI_MODELS.find((m) => m.id === modelId);
  }

  calculateCredits(model: string, promptTokens: number, completionTokens: number): number {
    const modelInfo = this.getModel(model);
    if (!modelInfo) {
      // Default calculation if model not found
      return Math.ceil((promptTokens + completionTokens) / 1000);
    }

    // Calculate based on token costs
    const inputCost = (promptTokens / 1000) * modelInfo.inputCostPer1k;
    const outputCost = (completionTokens / 1000) * modelInfo.outputCostPer1k;
    const totalCost = inputCost + outputCost;

    // Convert to credits (1 credit = $0.001)
    const credits = Math.ceil(totalCost * 1000);

    // Ensure minimum credits
    return Math.max(credits, modelInfo.creditsPerRequest);
  }

  private mapFinishReason(reason: string): 'stop' | 'length' | 'content_filter' | 'error' {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      default:
        return 'stop';
    }
  }
}
