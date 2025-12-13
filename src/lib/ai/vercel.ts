/**
 * Vercel AI SDK Provider Implementation
 * https://sdk.vercel.ai/docs
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

// Model ID mapping for Vercel AI SDK
const MODEL_MAPPING: Record<string, { provider: string; model: string }> = {
  'gpt-4o': { provider: 'openai', model: 'gpt-4o' },
  'gpt-4o-mini': { provider: 'openai', model: 'gpt-4o-mini' },
  'gpt-4-turbo': { provider: 'openai', model: 'gpt-4-turbo' },
  'claude-3-5-sonnet-20241022': { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
  'claude-3-haiku-20240307': { provider: 'anthropic', model: 'claude-3-haiku-20240307' },
  'claude-3-opus-20240229': { provider: 'anthropic', model: 'claude-3-opus-20240229' },
  'google/gemini-pro-1.5': { provider: 'google', model: 'gemini-1.5-pro' },
};

export class VercelAIProvider implements AIProviderInterface {
  private getModelMapping(modelId: string) {
    const mapping = MODEL_MAPPING[modelId];
    if (!mapping) {
      // Default to OpenAI
      return { provider: 'openai', model: modelId };
    }
    return mapping;
  }

  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const { provider, model } = this.getModelMapping(options.model);

    // Dynamic import based on provider
    let generateText: typeof import('ai').generateText;
    let modelInstance: Parameters<typeof generateText>[0]['model'];

    try {
      const ai = await import('ai');
      generateText = ai.generateText;

      switch (provider) {
        case 'openai': {
          const { openai } = await import('@ai-sdk/openai');
          modelInstance = openai(model);
          break;
        }
        case 'anthropic': {
          const { anthropic } = await import('@ai-sdk/anthropic');
          modelInstance = anthropic(model);
          break;
        }
        case 'google': {
          const { google } = await import('@ai-sdk/google');
          modelInstance = google(model);
          break;
        }
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const result = await generateText({
        model: modelInstance,
        messages: options.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1024,
      });

      const inputTokens = (result.usage as { inputTokens?: number; outputTokens?: number })?.inputTokens || 0;
      const outputTokens = (result.usage as { inputTokens?: number; outputTokens?: number })?.outputTokens || 0;

      return {
        id: `vercel-${Date.now()}`,
        content: result.text,
        model: options.model,
        usage: {
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        finishReason: this.mapFinishReason(result.finishReason),
      };
    } catch (error) {
      console.error('Vercel AI chat error:', error);
      throw new Error(`Vercel AI chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *chatStream(options: ChatCompletionOptions): AsyncIterable<StreamChunk> {
    const { provider, model } = this.getModelMapping(options.model);

    try {
      const { streamText } = await import('ai');
      let modelInstance: Parameters<typeof streamText>[0]['model'];

      switch (provider) {
        case 'openai': {
          const { openai } = await import('@ai-sdk/openai');
          modelInstance = openai(model);
          break;
        }
        case 'anthropic': {
          const { anthropic } = await import('@ai-sdk/anthropic');
          modelInstance = anthropic(model);
          break;
        }
        case 'google': {
          const { google } = await import('@ai-sdk/google');
          modelInstance = google(model);
          break;
        }
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const result = streamText({
        model: modelInstance,
        messages: options.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1024,
      });

      const requestId = `vercel-stream-${Date.now()}`;

      for await (const chunk of result.textStream) {
        yield {
          id: requestId,
          content: chunk,
          done: false,
        };
      }

      yield {
        id: requestId,
        content: '',
        done: true,
      };
    } catch (error) {
      console.error('Vercel AI stream error:', error);
      throw new Error(`Vercel AI stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async embed(options: EmbeddingOptions): Promise<EmbeddingResponse> {
    try {
      const { embed, embedMany } = await import('ai');
      const { openai } = await import('@ai-sdk/openai');

      const model = openai.embedding(options.model || 'text-embedding-3-small');
      const input = Array.isArray(options.input) ? options.input : [options.input];

      if (input.length === 1) {
        const result = await embed({
          model,
          value: input[0],
        });

        return {
          embeddings: [result.embedding],
          model: options.model || 'text-embedding-3-small',
          usage: {
            promptTokens: result.usage?.tokens || 0,
            totalTokens: result.usage?.tokens || 0,
          },
        };
      }

      const result = await embedMany({
        model,
        values: input,
      });

      return {
        embeddings: result.embeddings,
        model: options.model || 'text-embedding-3-small',
        usage: {
          promptTokens: result.usage?.tokens || 0,
          totalTokens: result.usage?.tokens || 0,
        },
      };
    } catch (error) {
      console.error('Vercel AI embed error:', error);
      throw new Error(`Vercel AI embed failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getModels(): AIModel[] {
    // Filter to models supported by Vercel AI SDK
    return AI_MODELS.filter((m) => MODEL_MAPPING[m.id]);
  }

  getModel(modelId: string): AIModel | undefined {
    return AI_MODELS.find((m) => m.id === modelId);
  }

  calculateCredits(model: string, promptTokens: number, completionTokens: number): number {
    const modelInfo = this.getModel(model);
    if (!modelInfo) {
      return Math.ceil((promptTokens + completionTokens) / 1000);
    }

    const inputCost = (promptTokens / 1000) * modelInfo.inputCostPer1k;
    const outputCost = (completionTokens / 1000) * modelInfo.outputCostPer1k;
    const totalCost = inputCost + outputCost;

    // Convert to credits (1 credit = $0.001)
    const credits = Math.ceil(totalCost * 1000);

    return Math.max(credits, modelInfo.creditsPerRequest);
  }

  private mapFinishReason(reason: string | undefined): 'stop' | 'length' | 'content_filter' | 'error' {
    switch (reason) {
      case 'stop':
      case 'end-turn':
        return 'stop';
      case 'length':
      case 'max-tokens':
        return 'length';
      case 'content-filter':
        return 'content_filter';
      default:
        return 'stop';
    }
  }
}
