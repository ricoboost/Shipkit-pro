/**
 * AI Provider Types
 *
 * Unified type definitions for the AI abstraction layer.
 * These types work with both OpenRouter and Vercel AI SDK providers.
 *
 * @module lib/ai/types
 */

/**
 * Supported AI provider backends.
 *
 * - `openrouter`: Routes requests through OpenRouter (access to multiple models)
 * - `vercel`: Uses Vercel AI SDK (direct provider integration)
 */
export type AIProvider = 'openrouter' | 'vercel';

/**
 * AI Model definition with pricing and capabilities.
 *
 * @example
 * ```typescript
 * const model: AIModel = {
 *   id: 'gpt-4-turbo',
 *   name: 'GPT-4 Turbo',
 *   provider: 'OpenAI',
 *   contextLength: 128000,
 *   inputCostPer1k: 0.01,
 *   outputCostPer1k: 0.03,
 *   creditsPerRequest: 15,
 * };
 * ```
 */
export interface AIModel {
  /** Unique model identifier used in API calls (e.g., 'gpt-4-turbo', 'claude-3-5-sonnet') */
  id: string;
  /** Human-readable model name for display */
  name: string;
  /** Model provider/vendor (e.g., 'OpenAI', 'Anthropic', 'Meta') */
  provider: string;
  /** Maximum context window size in tokens */
  contextLength: number;
  /** Cost per 1,000 input (prompt) tokens in USD */
  inputCostPer1k: number;
  /** Cost per 1,000 output (completion) tokens in USD */
  outputCostPer1k: number;
  /** Base credits charged per request (for credit-based billing) */
  creditsPerRequest: number;
}

/**
 * A single message in a chat conversation.
 *
 * @example
 * ```typescript
 * const messages: ChatMessage[] = [
 *   { role: 'system', content: 'You are a helpful assistant.' },
 *   { role: 'user', content: 'Hello!' },
 *   { role: 'assistant', content: 'Hi there! How can I help?' },
 *   { role: 'user', content: 'What is 2+2?' },
 * ];
 * ```
 */
export interface ChatMessage {
  /** Message author role */
  role: 'system' | 'user' | 'assistant';
  /** Message text content */
  content: string;
}

/**
 * Options for chat completion requests.
 *
 * @example
 * ```typescript
 * const options: ChatCompletionOptions = {
 *   model: 'gpt-4-turbo',
 *   messages: [
 *     { role: 'user', content: 'Explain quantum computing.' },
 *   ],
 *   temperature: 0.7,
 *   maxTokens: 1000,
 * };
 * ```
 */
export interface ChatCompletionOptions {
  /** Model ID to use for completion */
  model: string;
  /** Conversation history as array of messages */
  messages: ChatMessage[];
  /** Sampling temperature (0-2). Higher = more creative, lower = more deterministic */
  temperature?: number;
  /** Maximum tokens to generate in response */
  maxTokens?: number;
  /** Whether to stream the response (use chatStream instead for streaming) */
  stream?: boolean;
  /** User ID for tracking and rate limiting */
  userId?: string;
  /** Additional metadata to attach to the request */
  metadata?: Record<string, unknown>;
}

/**
 * Response from a chat completion request.
 *
 * @example
 * ```typescript
 * const response: ChatCompletionResponse = {
 *   id: 'chatcmpl-abc123',
 *   content: 'Quantum computing uses quantum mechanics...',
 *   model: 'gpt-4-turbo',
 *   usage: {
 *     promptTokens: 15,
 *     completionTokens: 250,
 *     totalTokens: 265,
 *   },
 *   finishReason: 'stop',
 * };
 * ```
 */
export interface ChatCompletionResponse {
  /** Unique identifier for this completion */
  id: string;
  /** Generated text content */
  content: string;
  /** Model that generated the response */
  model: string;
  /** Token usage statistics */
  usage: {
    /** Tokens in the input prompt */
    promptTokens: number;
    /** Tokens in the generated response */
    completionTokens: number;
    /** Total tokens used (prompt + completion) */
    totalTokens: number;
  };
  /** Reason the generation stopped */
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
}

/**
 * A chunk of streamed response data.
 *
 * @example
 * ```typescript
 * for await (const chunk of ai.chatStream(options)) {
 *   process.stdout.write(chunk.content);
 *   if (chunk.done) break;
 * }
 * ```
 */
export interface StreamChunk {
  /** Request identifier */
  id: string;
  /** Partial content in this chunk */
  content: string;
  /** Whether this is the final chunk */
  done: boolean;
}

/**
 * Options for text embedding requests.
 *
 * @example
 * ```typescript
 * // Single text
 * const options: EmbeddingOptions = {
 *   model: 'text-embedding-3-small',
 *   input: 'Search query text',
 * };
 *
 * // Multiple texts (batch)
 * const options: EmbeddingOptions = {
 *   model: 'text-embedding-3-small',
 *   input: ['Document 1', 'Document 2', 'Document 3'],
 * };
 * ```
 */
export interface EmbeddingOptions {
  /** Embedding model ID */
  model: string;
  /** Text(s) to embed - single string or array for batch */
  input: string | string[];
  /** User ID for tracking */
  userId?: string;
}

/**
 * Response from an embedding request.
 *
 * Each embedding is a vector of floating-point numbers representing the semantic
 * meaning of the input text. Use for similarity search, clustering, or RAG.
 *
 * @example
 * ```typescript
 * const response: EmbeddingResponse = {
 *   embeddings: [[0.123, -0.456, 0.789, ...]], // 1536 dimensions for ada-002
 *   model: 'text-embedding-3-small',
 *   usage: { promptTokens: 8, totalTokens: 8 },
 * };
 *
 * // Calculate similarity between two embeddings
 * const similarity = cosineSimilarity(response.embeddings[0], otherEmbedding);
 * ```
 */
export interface EmbeddingResponse {
  /** Array of embedding vectors (one per input text) */
  embeddings: number[][];
  /** Model used for embedding */
  model: string;
  /** Token usage statistics */
  usage: {
    /** Tokens in the input text(s) */
    promptTokens: number;
    /** Total tokens processed */
    totalTokens: number;
  };
}

/**
 * Record of AI usage for tracking and billing.
 *
 * Stored in the database for analytics and credit management.
 */
export interface AIUsageRecord {
  /** User who made the request */
  userId: string;
  /** Organization context (for team billing) */
  organizationId?: string;
  /** Model used for the request */
  model: string;
  /** Type of AI operation */
  type: 'chat' | 'completion' | 'embedding' | 'image';
  /** Input/prompt tokens used */
  promptTokens: number;
  /** Output/completion tokens used */
  completionTokens: number;
  /** Total tokens (prompt + completion) */
  totalTokens: number;
  /** Credits charged for this request */
  creditsUsed: number;
  /** Unique request identifier */
  requestId: string;
  /** Additional request metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Interface that all AI providers must implement.
 *
 * Implement this interface to add support for new AI backends.
 *
 * @example
 * ```typescript
 * class CustomAIProvider implements AIProviderInterface {
 *   async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
 *     // Make API call to your provider
 *     const response = await fetch('https://api.custom-ai.com/chat', {
 *       method: 'POST',
 *       body: JSON.stringify(options),
 *     });
 *     return response.json();
 *   }
 *
 *   async *chatStream(options: ChatCompletionOptions): AsyncIterable<StreamChunk> {
 *     // Stream responses from your provider
 *   }
 *
 *   async embed(options: EmbeddingOptions): Promise<EmbeddingResponse> {
 *     // Generate embeddings
 *   }
 *
 *   getModels(): AIModel[] {
 *     return [{ id: 'custom-model', ... }];
 *   }
 *
 *   getModel(modelId: string): AIModel | undefined {
 *     return this.getModels().find(m => m.id === modelId);
 *   }
 *
 *   calculateCredits(model: string, promptTokens: number, completionTokens: number): number {
 *     // Your credit calculation logic
 *     return Math.ceil((promptTokens + completionTokens) / 1000);
 *   }
 * }
 * ```
 */
export interface AIProviderInterface {
  /**
   * Sends a chat completion request.
   * @param options - Chat options including model and messages
   * @returns Complete response with content and usage
   */
  chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse>;

  /**
   * Streams a chat completion response.
   * @param options - Chat options including model and messages
   * @yields Chunks of the response as they arrive
   */
  chatStream(options: ChatCompletionOptions): AsyncIterable<StreamChunk>;

  /**
   * Generates text embeddings.
   * @param options - Embedding options including model and input text
   * @returns Vector embeddings for the input
   */
  embed(options: EmbeddingOptions): Promise<EmbeddingResponse>;

  /**
   * Returns all available models for this provider.
   * @returns Array of model definitions
   */
  getModels(): AIModel[];

  /**
   * Gets a specific model by ID.
   * @param modelId - The model identifier
   * @returns Model info or undefined if not found
   */
  getModel(modelId: string): AIModel | undefined;

  /**
   * Calculates credits to charge for a request.
   * @param model - Model ID used
   * @param promptTokens - Input token count
   * @param completionTokens - Output token count
   * @returns Number of credits to charge
   */
  calculateCredits(model: string, promptTokens: number, completionTokens: number): number;
}

/**
 * Pre-configured AI models with pricing information.
 *
 * Includes models from OpenAI, Anthropic, Meta, Mistral, and Google.
 * Pricing is approximate and may vary by provider/region.
 *
 * @example
 * ```typescript
 * import { AI_MODELS } from '@/lib/ai';
 *
 * // Find cheapest model
 * const cheapest = AI_MODELS.reduce((min, m) =>
 *   m.creditsPerRequest < min.creditsPerRequest ? m : min
 * );
 *
 * // Filter by provider
 * const anthropicModels = AI_MODELS.filter(m => m.provider === 'Anthropic');
 *
 * // Find model with largest context
 * const largestContext = AI_MODELS.reduce((max, m) =>
 *   m.contextLength > max.contextLength ? m : max
 * );
 * ```
 */
export const AI_MODELS: AIModel[] = [
  // OpenAI models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextLength: 128000,
    inputCostPer1k: 0.005,
    outputCostPer1k: 0.015,
    creditsPerRequest: 10,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    contextLength: 128000,
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
    creditsPerRequest: 2,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    contextLength: 128000,
    inputCostPer1k: 0.01,
    outputCostPer1k: 0.03,
    creditsPerRequest: 15,
  },
  // Anthropic models
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    contextLength: 200000,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    creditsPerRequest: 8,
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    contextLength: 200000,
    inputCostPer1k: 0.00025,
    outputCostPer1k: 0.00125,
    creditsPerRequest: 1,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    contextLength: 200000,
    inputCostPer1k: 0.015,
    outputCostPer1k: 0.075,
    creditsPerRequest: 25,
  },
  // Meta models
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    contextLength: 131072,
    inputCostPer1k: 0.00052,
    outputCostPer1k: 0.00075,
    creditsPerRequest: 3,
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    contextLength: 131072,
    inputCostPer1k: 0.00006,
    outputCostPer1k: 0.00006,
    creditsPerRequest: 1,
  },
  // Mistral models
  {
    id: 'mistralai/mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B',
    provider: 'Mistral',
    contextLength: 32768,
    inputCostPer1k: 0.00024,
    outputCostPer1k: 0.00024,
    creditsPerRequest: 2,
  },
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    contextLength: 128000,
    inputCostPer1k: 0.002,
    outputCostPer1k: 0.006,
    creditsPerRequest: 5,
  },
  // Google models
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'Google',
    contextLength: 1000000,
    inputCostPer1k: 0.00125,
    outputCostPer1k: 0.005,
    creditsPerRequest: 5,
  },
];
