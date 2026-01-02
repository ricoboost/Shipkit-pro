#!/usr/bin/env tsx
/**
 * AI Provider Setup Script
 *
 * Configures AI/LLM provider for your ShipKit application.
 *
 * Usage: npx tsx scripts/setup/setup-ai.ts
 * With args: npx tsx scripts/setup/setup-ai.ts --provider openai
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

type AIProvider = 'openai' | 'anthropic' | 'google' | 'openrouter';

interface AIConfig {
  name: string;
  description: string;
  envVar: string;
  models: string[];
  signupUrl: string;
  setupInstructions: string[];
}

const aiProviders: Record<AIProvider, AIConfig> = {
  openai: {
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5, and embedding models',
    envVar: 'OPENAI_API_KEY',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    signupUrl: 'https://platform.openai.com/api-keys',
    setupInstructions: [
      '1. Create account at https://platform.openai.com',
      '2. Go to API Keys section',
      '3. Create new secret key',
      '4. Copy and paste the key below',
    ],
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus, and other Claude models',
    envVar: 'ANTHROPIC_API_KEY',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    signupUrl: 'https://console.anthropic.com/settings/keys',
    setupInstructions: [
      '1. Create account at https://console.anthropic.com',
      '2. Go to Settings > API Keys',
      '3. Create new API key',
      '4. Copy and paste the key below',
    ],
  },
  google: {
    name: 'Google AI (Gemini)',
    description: 'Gemini Pro, Gemini Flash, and other Google models',
    envVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
    signupUrl: 'https://aistudio.google.com/app/apikey',
    setupInstructions: [
      '1. Go to https://aistudio.google.com/app/apikey',
      '2. Sign in with Google account',
      '3. Create API key',
      '4. Copy and paste the key below',
    ],
  },
  openrouter: {
    name: 'OpenRouter',
    description: 'Access 100+ models through one API (OpenAI, Anthropic, Meta, etc.)',
    envVar: 'OPENROUTER_API_KEY',
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.1-70b'],
    signupUrl: 'https://openrouter.ai/keys',
    setupInstructions: [
      '1. Create account at https://openrouter.ai',
      '2. Go to Keys section',
      '3. Create new API key',
      '4. Add credits to your account',
      '5. Copy and paste the key below',
    ],
  },
};

async function main() {
  console.log('\n> ShipKit AI Setup\n');
  console.log('Configure AI/LLM provider for your application.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  // Parse command line arguments
  const args = process.argv.slice(2);
  let selectedProvider: AIProvider | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--provider' && args[i + 1]) {
      const provider = args[i + 1] as AIProvider;
      if (aiProviders[provider]) {
        selectedProvider = provider;
      }
      i++;
    }
  }

  // Interactive selection if not provided
  if (!selectedProvider) {
    console.log('Available AI providers:\n');

    const providerList = Object.entries(aiProviders);
    providerList.forEach(([, config], index) => {
      console.log(`  ${index + 1}. ${config.name}`);
      console.log(`     ${config.description}`);
      console.log(`     Models: ${config.models.slice(0, 3).join(', ')}\n`);
    });

    const choice = await question('Select provider (1-4): ');
    const index = parseInt(choice) - 1;

    if (index >= 0 && index < providerList.length) {
      selectedProvider = providerList[index][0] as AIProvider;
    } else {
      console.error('\nL Invalid selection');
      rl.close();
      process.exit(1);
    }
  }

  const config = aiProviders[selectedProvider];
  console.log(`\n Selected: ${config.name}\n`);

  // Update .env with AI_PROVIDER
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');

    // Update or add AI_PROVIDER
    if (envContent.includes('AI_PROVIDER=')) {
      envContent = envContent.replace(
        /AI_PROVIDER=.*/,
        `AI_PROVIDER="${selectedProvider}"`
      );
    } else {
      envContent += `\n# AI Provider\nAI_PROVIDER="${selectedProvider}"\n`;
    }
  } else {
    envContent = `# AI Provider\nAI_PROVIDER="${selectedProvider}"\n`;
  }

  // Check if API key is already set
  const hasApiKey = envContent.includes(`${config.envVar}=`) &&
    !envContent.includes(`${config.envVar}=""`) &&
    !envContent.includes(`${config.envVar}=\n`);

  if (hasApiKey) {
    console.log(` ${config.envVar} is already configured\n`);
    fs.writeFileSync(envPath, envContent);
    rl.close();
  } else {
    // Show setup instructions
    console.log('=� Setup Instructions:\n');
    config.setupInstructions.forEach((instruction) => {
      console.log(`  ${instruction}`);
    });

    console.log(`\n= Get your API key: ${config.signupUrl}\n`);

    // Ask for API key
    const apiKey = await question(`${config.envVar}: `);

    if (apiKey.trim()) {
      if (envContent.includes(`${config.envVar}=`)) {
        envContent = envContent.replace(
          new RegExp(`${config.envVar}=.*`),
          `${config.envVar}="${apiKey.trim()}"`
        );
      } else {
        envContent += `${config.envVar}="${apiKey.trim()}"\n`;
      }
      console.log(`\n API key saved\n`);
    } else {
      console.log(`\n�  No API key provided. Add it to .env manually.\n`);
    }

    fs.writeFileSync(envPath, envContent);
    rl.close();
  }

  // Show available models
  console.log('=� Available Models:\n');
  config.models.forEach((model) => {
    console.log(`  " ${model}`);
  });

  // Test API key
  console.log('\n= Testing API connection...\n');

  try {
    // Simple validation - just check key format
    const key = envContent.match(new RegExp(`${config.envVar}="([^"]*)"`));
    if (key && key[1]) {
      const keyValue = key[1];
      let valid = false;

      switch (selectedProvider) {
        case 'openai':
          valid = keyValue.startsWith('sk-');
          break;
        case 'anthropic':
          valid = keyValue.startsWith('sk-ant-');
          break;
        case 'google':
          valid = keyValue.length > 20;
          break;
        case 'openrouter':
          valid = keyValue.startsWith('sk-or-');
          break;
      }

      if (valid) {
        console.log(' API key format looks valid\n');
      } else {
        console.log('�  API key format may be incorrect. Please verify.\n');
      }
    }
  } catch {
    console.log('�  Could not validate API key format\n');
  }

  console.log('Next steps:');
  console.log('  1. Test AI features at /ai-playground');
  console.log('  2. Check src/lib/ai/index.ts for AI utilities');
  console.log('  3. Use the AI SDK: import { ai } from "@/lib/ai"\n');
}

main().catch(console.error);
