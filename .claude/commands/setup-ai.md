# Configure AI Provider

Set up your AI/LLM provider for ShipKit's AI features.

## Instructions

Run the AI setup script:

```bash
npx tsx scripts/setup/setup-ai.ts
```

## Supported AI Providers

### 1. OpenAI
GPT-4, GPT-3.5, and embedding models.

```bash
npx tsx scripts/setup/setup-ai.ts --provider openai
```

Models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`

Required: `OPENAI_API_KEY`

Get key: https://platform.openai.com/api-keys

### 2. Anthropic
Claude 3.5 Sonnet, Claude 3 Opus, and other Claude models.

```bash
npx tsx scripts/setup/setup-ai.ts --provider anthropic
```

Models: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, `claude-3-haiku-20240307`

Required: `ANTHROPIC_API_KEY`

Get key: https://console.anthropic.com/settings/keys

### 3. Google AI (Gemini)
Gemini Pro, Gemini Flash, and other Google models.

```bash
npx tsx scripts/setup/setup-ai.ts --provider google
```

Models: `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-pro`

Required: `GOOGLE_GENERATIVE_AI_API_KEY`

Get key: https://aistudio.google.com/app/apikey

### 4. OpenRouter
Access 100+ models through one API.

```bash
npx tsx scripts/setup/setup-ai.ts --provider openrouter
```

Models: All OpenAI, Anthropic, Meta, Mistral models and more

Required: `OPENROUTER_API_KEY`

Get key: https://openrouter.ai/keys

## Using AI in Your App

After setup, use the AI SDK:

```typescript
import { ai } from '@/lib/ai';

// Chat completion
const response = await ai.chat({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
});

// Streaming
const stream = await ai.chatStream({
  model: 'claude-3-5-sonnet-20241022',
  messages: [{ role: 'user', content: 'Write a story' }],
});

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

## Test Your Setup

Visit the AI Playground at `/ai-playground` to test your configuration.
