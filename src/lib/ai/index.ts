/**
 * AI Provider Abstraction Layer
 *
 * Provides a unified API for AI operations (chat, streaming, embeddings)
 * that works with OpenRouter or Vercel AI SDK. Switch providers via
 * the AI_PROVIDER environment variable.
 *
 * Features:
 * - Chat completions (streaming and non-streaming)
 * - Text embeddings for semantic search
 * - Automatic credit tracking and deduction
 * - Usage statistics and analytics
 *
 * @example
 * ```typescript
 * import { ai } from '@/lib/ai';
 *
 * // Non-streaming chat
 * const response = await ai.chat({
 *   model: 'gpt-4-turbo',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 *   userId: session.user.id,
 * });
 * console.log(response.content);
 *
 * // Streaming chat
 * for await (const chunk of ai.chatStream(options)) {
 *   process.stdout.write(chunk.content);
 *   if (chunk.done) break;
 * }
 *
 * // Generate embeddings
 * const { embeddings } = await ai.embed({
 *   model: 'text-embedding-3-small',
 *   input: 'Search query text',
 *   userId: session.user.id,
 * });
 * ```
 *
 * @module lib/ai
 */

import type {
  AIProvider,
  AIProviderInterface,
  ChatCompletionOptions,
  ChatCompletionResponse,
  StreamChunk,
  EmbeddingOptions,
  EmbeddingResponse,
  AIModel,
  AIUsageRecord,
} from './types';
import { AI_MODELS } from './types';
import { db } from '@/lib/db';
import { credits } from '@/lib/payments';

/** Current AI provider from environment @internal */
const AI_PROVIDER = (process.env.AI_PROVIDER || 'openrouter') as AIProvider;

let providerInstance: AIProviderInterface | null = null;

async function getAIProvider(): Promise<AIProviderInterface> {
  if (providerInstance) return providerInstance;

  switch (AI_PROVIDER) {
    case 'openrouter': {
      const { OpenRouterProvider } = await import('./openrouter');
      providerInstance = new OpenRouterProvider();
      break;
    }
    case 'vercel': {
      const { VercelAIProvider } = await import('./vercel');
      providerInstance = new VercelAIProvider();
      break;
    }
    default:
      throw new Error(`Unknown AI provider: ${AI_PROVIDER}`);
  }

  return providerInstance;
}

// Track AI usage in database and deduct credits
async function trackUsage(record: AIUsageRecord): Promise<void> {
  try {
    // Record usage in database
    await db.aIUsage.create({
      data: {
        userId: record.userId,
        organizationId: record.organizationId,
        model: record.model,
        type: record.type.toUpperCase() as 'CHAT' | 'COMPLETION' | 'EMBEDDING' | 'IMAGE',
        promptTokens: record.promptTokens,
        completionTokens: record.completionTokens,
        totalTokens: record.totalTokens,
        creditsUsed: record.creditsUsed,
        metadata: record.metadata as object,
      },
    });

    // Deduct credits
    if (record.creditsUsed > 0) {
      await credits.useCredits({
        userId: record.userId,
        amount: record.creditsUsed,
        type: 'BURN',
        description: `AI usage: ${record.model}`,
        metadata: {
          requestId: record.requestId,
          model: record.model,
          tokens: record.totalTokens,
        },
      });
    }
  } catch (error) {
    console.error('Failed to track AI usage:', error);
  }
}

/**
 * Unified AI API object.
 *
 * Provides methods for AI operations with automatic credit tracking.
 * All operations require a userId for credit management.
 */
export const ai = {
  /** Returns the currently configured AI provider name ('openrouter' or 'vercel') */
  getProvider: (): AIProvider => AI_PROVIDER,

  /**
   * Returns all available AI models.
   * @returns Array of model definitions with pricing and capabilities
   */
  getModels: (): AIModel[] => AI_MODELS,

  /**
   * Gets a specific model by ID.
   * @param modelId - The model identifier (e.g., 'gpt-4-turbo', 'claude-3-sonnet')
   * @returns Model info or undefined if not found
   */
  getModel: (modelId: string): AIModel | undefined => {
    return AI_MODELS.find((m) => m.id === modelId);
  },

  /**
   * Sends a chat completion request to the AI provider.
   *
   * Automatically checks credit balance before sending and tracks usage after.
   * Throws an error if the user has insufficient credits.
   *
   * @param options - Chat options including model, messages, and userId
   * @returns The AI response with content and usage statistics
   * @throws Error if user has insufficient credits
   *
   * @example
   * ```typescript
   * const response = await ai.chat({
   *   model: 'gpt-4-turbo',
   *   messages: [
   *     { role: 'system', content: 'You are a helpful assistant.' },
   *     { role: 'user', content: 'Explain quantum computing.' },
   *   ],
   *   userId: session.user.id,
   *   organizationId: org.id, // optional
   * });
   *
   * console.log(response.content);
   * console.log(`Tokens used: ${response.usage.totalTokens}`);
   * ```
   */
  chat: async (
    options: ChatCompletionOptions & { userId: string; organizationId?: string }
  ): Promise<ChatCompletionResponse> => {
    const provider = await getAIProvider();

    // Check if user has enough credits
    const model = ai.getModel(options.model);
    const estimatedCredits = model?.creditsPerRequest || 5;

    const balanceCheck = await credits.checkBalance(options.userId, estimatedCredits);
    if (!balanceCheck.hasEnough) {
      throw new Error(`Insufficient credits. Required: ${estimatedCredits}, Available: ${balanceCheck.balance}`);
    }

    const response = await provider.chat(options);

    // Calculate actual credits used
    const creditsUsed = provider.calculateCredits(
      options.model,
      response.usage.promptTokens,
      response.usage.completionTokens
    );

    // Track usage
    await trackUsage({
      userId: options.userId,
      organizationId: options.organizationId,
      model: options.model,
      type: 'chat',
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
      creditsUsed,
      requestId: response.id,
      metadata: options.metadata,
    });

    return response;
  },

  /**
   * Streams a chat completion response from the AI provider.
   *
   * Returns an async iterator that yields chunks as they arrive.
   * Credit tracking occurs after the stream completes.
   *
   * @param options - Chat options including model, messages, and userId
   * @yields StreamChunk objects with partial content and completion status
   * @throws Error if user has insufficient credits
   *
   * @example
   * ```typescript
   * // Stream response to the client
   * for await (const chunk of ai.chatStream({
   *   model: 'gpt-4-turbo',
   *   messages: [{ role: 'user', content: 'Write a poem.' }],
   *   userId: session.user.id,
   * })) {
   *   process.stdout.write(chunk.content);
   *   if (chunk.done) {
   *     console.log('\n--- Stream complete ---');
   *     break;
   *   }
   * }
   *
   * // Or collect into a string
   * let fullResponse = '';
   * for await (const chunk of ai.chatStream(options)) {
   *   fullResponse += chunk.content;
   * }
   * ```
   */
  chatStream: async function* (
    options: ChatCompletionOptions & { userId: string; organizationId?: string }
  ): AsyncIterable<StreamChunk> {
    const provider = await getAIProvider();

    // Check credits before starting
    const model = ai.getModel(options.model);
    const estimatedCredits = model?.creditsPerRequest || 5;

    const balanceCheck = await credits.checkBalance(options.userId, estimatedCredits);
    if (!balanceCheck.hasEnough) {
      throw new Error(`Insufficient credits. Required: ${estimatedCredits}, Available: ${balanceCheck.balance}`);
    }

    let totalContent = '';
    let requestId = '';

    for await (const chunk of provider.chatStream(options)) {
      totalContent += chunk.content;
      requestId = chunk.id;
      yield chunk;

      if (chunk.done) {
        // Estimate tokens for streaming (rough approximation)
        const estimatedPromptTokens = options.messages.reduce(
          (acc, m) => acc + Math.ceil(m.content.length / 4),
          0
        );
        const estimatedCompletionTokens = Math.ceil(totalContent.length / 4);

        const creditsUsed = provider.calculateCredits(
          options.model,
          estimatedPromptTokens,
          estimatedCompletionTokens
        );

        // Track usage after stream completes
        await trackUsage({
          userId: options.userId,
          organizationId: options.organizationId,
          model: options.model,
          type: 'chat',
          promptTokens: estimatedPromptTokens,
          completionTokens: estimatedCompletionTokens,
          totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
          creditsUsed,
          requestId,
          metadata: options.metadata,
        });
      }
    }
  },

  /**
   * Generates text embeddings for semantic search and similarity.
   *
   * Embeddings are vector representations of text that can be used for:
   * - Semantic search (finding similar content)
   * - Document clustering
   * - Recommendation systems
   * - RAG (Retrieval Augmented Generation)
   *
   * @param options - Embedding options including model, input text, and userId
   * @returns Vector embeddings and usage statistics
   *
   * @example
   * ```typescript
   * // Single text embedding
   * const { embeddings } = await ai.embed({
   *   model: 'text-embedding-3-small',
   *   input: 'How do I reset my password?',
   *   userId: session.user.id,
   * });
   *
   * // Multiple texts at once
   * const { embeddings } = await ai.embed({
   *   model: 'text-embedding-3-small',
   *   input: ['Document 1 content', 'Document 2 content'],
   *   userId: session.user.id,
   * });
   *
   * // Use with vector database for similarity search
   * const queryEmbedding = embeddings[0];
   * const similarDocs = await vectorDb.search(queryEmbedding, { limit: 5 });
   * ```
   */
  embed: async (
    options: EmbeddingOptions & { userId: string; organizationId?: string }
  ): Promise<EmbeddingResponse> => {
    const provider = await getAIProvider();
    const response = await provider.embed(options);

    // Calculate and track usage
    const creditsUsed = Math.ceil(response.usage.totalTokens / 1000);

    await trackUsage({
      userId: options.userId,
      organizationId: options.organizationId,
      model: options.model,
      type: 'embedding',
      promptTokens: response.usage.promptTokens,
      completionTokens: 0,
      totalTokens: response.usage.totalTokens,
      creditsUsed,
      requestId: `embed-${Date.now()}`,
      metadata: { inputCount: Array.isArray(options.input) ? options.input.length : 1 },
    });

    return response;
  },

  /**
   * Retrieves AI usage statistics for a user.
   *
   * Returns detailed usage records and aggregated totals including
   * request counts, token usage, and credits consumed.
   *
   * @param userId - The user ID to get statistics for
   * @param options - Optional filters for date range and organization
   * @returns Usage records and aggregated totals by model
   *
   * @example
   * ```typescript
   * // Get all-time usage
   * const stats = await ai.getUsageStats(session.user.id);
   * console.log(`Total requests: ${stats.totals.totalRequests}`);
   * console.log(`Total tokens: ${stats.totals.totalTokens}`);
   * console.log(`Total credits: ${stats.totals.totalCredits}`);
   *
   * // Get usage for current month
   * const monthStart = new Date();
   * monthStart.setDate(1);
   * const stats = await ai.getUsageStats(session.user.id, {
   *   startDate: monthStart,
   *   endDate: new Date(),
   * });
   *
   * // Get organization usage
   * const orgStats = await ai.getUsageStats(session.user.id, {
   *   organizationId: org.id,
   * });
   *
   * // Access per-model breakdown
   * Object.entries(stats.totals.byModel).forEach(([model, count]) => {
   *   console.log(`${model}: ${count} requests`);
   * });
   * ```
   */
  getUsageStats: async (
    userId: string,
    options?: { startDate?: Date; endDate?: Date; organizationId?: string }
  ) => {
    const where: Record<string, unknown> = { userId };

    if (options?.organizationId) {
      where.organizationId = options.organizationId;
    }

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        (where.createdAt as Record<string, Date>).gte = options.startDate;
      }
      if (options.endDate) {
        (where.createdAt as Record<string, Date>).lte = options.endDate;
      }
    }

    const usage = await db.aIUsage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const totals = usage.reduce(
      (acc, u) => ({
        totalRequests: acc.totalRequests + 1,
        totalTokens: acc.totalTokens + u.totalTokens,
        totalCredits: acc.totalCredits + u.creditsUsed,
        byModel: {
          ...acc.byModel,
          [u.model]: (acc.byModel[u.model] || 0) + 1,
        },
      }),
      { totalRequests: 0, totalTokens: 0, totalCredits: 0, byModel: {} as Record<string, number> }
    );

    return {
      usage,
      totals,
    };
  },
};

export * from './types';
