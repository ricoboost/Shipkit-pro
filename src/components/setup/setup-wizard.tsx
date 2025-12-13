'use client';

/**
 * Setup Wizard Component
 * Beginner-friendly onboarding for ShipKit - designed for users new to coding
 * Works great with AI assistants like Claude Code or Cursor
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDemoContext } from '@/components/providers/demo-provider';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Database,
  Shield,
  CreditCard,
  Bot,
  Rocket,
  Copy,
  Sparkles,
  Play,
  CheckCircle2,
  Circle,
  MessageSquare,
  ExternalLink,
  Lightbulb,
  Wand2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

interface SetupStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  isComplete: boolean;
}

const SETUP_STORAGE_KEY = 'shipkit-setup-progress';

export function SetupWizard() {
  const router = useRouter();
  const { isDemo, enable: enableDemo } = useDemoContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const handleStartDemo = () => {
    // Use dedicated demo route to ensure demo mode is enabled
    router.push('/demo');
  };

  const steps: SetupStep[] = [
    {
      id: 'database',
      title: 'Connect Database',
      subtitle: 'Where your data lives',
      icon: Database,
      isComplete: completedSteps.includes('database'),
    },
    {
      id: 'auth',
      title: 'Setup Login',
      subtitle: 'User authentication',
      icon: Shield,
      isComplete: completedSteps.includes('auth'),
    },
    {
      id: 'payments',
      title: 'Accept Payments',
      subtitle: 'Stripe, Lemon, or Polar',
      icon: CreditCard,
      isComplete: completedSteps.includes('payments'),
    },
    {
      id: 'ai',
      title: 'Add AI Features',
      subtitle: 'ChatGPT, Claude & more',
      icon: Bot,
      isComplete: completedSteps.includes('ai'),
    },
    {
      id: 'launch',
      title: 'Vibe Your App',
      subtitle: 'Create admin & start',
      icon: Rocket,
      isComplete: completedSteps.includes('launch'),
    },
  ];

  useEffect(() => {
    const saved = localStorage.getItem(SETUP_STORAGE_KEY);
    if (saved) {
      try {
        const { completed, dismissed } = JSON.parse(saved);
        setCompletedSteps(completed || []);
        if (dismissed) setIsVisible(false);
      } catch {
        // Invalid JSON, reset
      }
    }
  }, []);

  const saveProgress = (completed: string[], dismissed = false) => {
    localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify({ completed, dismissed }));
  };

  const markStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const newCompleted = [...completedSteps, stepId];
      setCompletedSteps(newCompleted);
      saveProgress(newCompleted);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const progress = Math.round((completedSteps.length / steps.length) * 100);

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <Card className="overflow-hidden border-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Wand2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Let&apos;s Set Up Your App</h2>
                <p className="text-muted-foreground">
                  Follow these steps or use AI to help you
                </p>
              </div>
            </div>
            <Button
              onClick={handleStartDemo}
              size="lg"
              variant={isDemo ? 'default' : 'default'}
              className="gap-2 shadow-lg bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="h-5 w-5" />
              {isDemo ? 'Go to Dashboard' : 'Try Demo Mode'}
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-muted/30 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Your Progress</span>
            <span className="text-sm text-muted-foreground">{completedSteps.length} of {steps.length} complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Overview */}
        <div className="px-6 py-4 border-b bg-background">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`flex flex-col items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  index === currentStep
                    ? 'bg-primary/10 scale-105'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    step.isComplete
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === currentStep
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {step.isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <span className={`text-xs font-medium ${index === currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <CardContent className="p-6">
          <StepContent
            step={steps[currentStep]}
            stepNumber={currentStep + 1}
            onComplete={() => markStepComplete(steps[currentStep].id)}
            onNext={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            onPrev={() => setCurrentStep(Math.max(0, currentStep - 1))}
            isFirst={currentStep === 0}
            isLast={currentStep === steps.length - 1}
            totalSteps={steps.length}
          />
        </CardContent>
      </Card>

      {/* AI Assistant Tip */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Using an AI Coding Agent?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Copy this prompt into <strong>Claude Code</strong>, <strong>Cursor</strong>, <strong>GitHub Copilot</strong>, or <strong>Gemini</strong> to get help with this step:
              </p>
              <AIPromptBlock currentStep={steps[currentStep].id} stepTitle={steps[currentStep].title} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AIPromptBlock({ currentStep, stepTitle }: { currentStep: string; stepTitle: string }) {
  const prompts: Record<string, string> = {
    database: `Help me connect a PostgreSQL database to my ShipKit project.

I need you to:
1. Suggest a free database provider (Supabase or Neon)
2. Help me create the database and get the connection URL
3. Add the DATABASE_URL to my .env file
4. Run "npx prisma db push" to set up the schema

Please guide me step by step.`,

    auth: `Help me set up user authentication in my ShipKit project.

I want to use Supabase Auth (or suggest NextAuth/Better Auth as alternatives).

Please:
1. Show me what environment variables I need
2. Help me find the values in my Supabase dashboard
3. Add them to my .env file
4. Verify the auth is working

Guide me step by step.`,

    payments: `Help me set up payment processing in my ShipKit project.

I want to use Stripe (or suggest LemonSqueezy/Polar as alternatives).

Please:
1. Help me create a Stripe account if needed
2. Get my API keys (test mode first)
3. Add the environment variables to my .env file
4. Set up the webhook endpoint

Guide me step by step.`,

    ai: `Help me add AI features to my ShipKit project.

I want to use OpenRouter (or suggest OpenAI/Anthropic as alternatives).

Please:
1. Help me create an account and get an API key
2. Add the environment variables to my .env file
3. Test that the AI integration is working

Guide me step by step.`,

    launch: `Help me deploy my ShipKit project to production.

Please:
1. Run a build to check for errors: npm run build
2. Fix any issues that come up
3. Help me deploy to Vercel (or suggest alternatives)
4. Set up environment variables in the deployment

Guide me step by step.`,
  };

  const prompt = prompts[currentStep] || prompts.database;

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied! Paste it into your AI coding agent');
  };

  return (
    <div className="relative">
      <div className="bg-zinc-900 text-zinc-100 p-4 pr-24 rounded-lg text-sm font-mono">
        <div className="flex items-start gap-2">
          <MessageSquare className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <span className="text-zinc-300 whitespace-pre-wrap">{prompt}</span>
        </div>
      </div>
      <Button
        size="sm"
        onClick={copyPrompt}
        className="absolute top-3 right-3 gap-1.5 shadow-lg"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy
      </Button>
    </div>
  );
}

function AuthProviderTabs({
  CopyableCode,
  Tip
}: {
  CopyableCode: React.FC<{ code: string; label: string }>;
  Tip: React.FC<{ children: React.ReactNode }>;
}) {
  const [activeProvider, setActiveProvider] = useState<'supabase' | 'nextauth' | 'betterauth'>('supabase');

  const providers = [
    { id: 'supabase' as const, name: 'Supabase', recommended: true },
    { id: 'nextauth' as const, name: 'NextAuth' },
    { id: 'betterauth' as const, name: 'Better Auth' },
  ];

  return (
    <div className="space-y-4">
      {/* Provider Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => setActiveProvider(provider.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeProvider === provider.id
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {provider.name}
            {provider.recommended && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                Recommended
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Supabase Auth */}
      {activeProvider === 'supabase' && (
        <div className="space-y-4">
          <div className="p-4 border-2 border-green-200 dark:border-green-900 rounded-lg bg-green-50 dark:bg-green-950/30">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Best choice if you&apos;re using Supabase for your database!</strong> Auth is already included - no extra setup needed.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add these to your <code className="bg-muted px-1.5 py-0.5 rounded">.env</code> file:
            </p>
            <div className="space-y-2">
              <CopyableCode code='AUTH_PROVIDER="supabase"' label="Auth provider" />
              <CopyableCode code='NEXT_PUBLIC_SUPABASE_URL="your-project-url"' label="Supabase URL" />
              <CopyableCode code='NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"' label="Supabase key" />
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Where to find these values?</h4>
            <p className="text-sm text-muted-foreground">
              In your Supabase dashboard, go to <strong>Settings → API</strong>. You&apos;ll see your Project URL and anon/public key right there.
            </p>
          </div>
        </div>
      )}

      {/* NextAuth */}
      {activeProvider === 'nextauth' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            NextAuth.js is a flexible authentication solution for Next.js apps. Great if you want full control over auth.
          </p>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add these to your <code className="bg-muted px-1.5 py-0.5 rounded">.env</code> file:
            </p>
            <div className="space-y-2">
              <CopyableCode code='AUTH_PROVIDER="nextauth"' label="Auth provider" />
              <CopyableCode code='AUTH_SECRET="your-secret-here"' label="Auth secret" />
            </div>
          </div>

          <Tip>
            Generate a secure secret by running: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">openssl rand -base64 32</code>
          </Tip>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Adding OAuth Providers (Optional)</h4>
            <p className="text-sm text-muted-foreground">
              Want Google or GitHub login? Add their credentials too:
            </p>
            <div className="mt-2 space-y-2">
              <CopyableCode code='GOOGLE_CLIENT_ID="..."' label="Google ID" />
              <CopyableCode code='GOOGLE_CLIENT_SECRET="..."' label="Google secret" />
            </div>
          </div>
        </div>
      )}

      {/* Better Auth */}
      {activeProvider === 'betterauth' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Better Auth is a modern, type-safe authentication library. Lightweight and developer-friendly.
          </p>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add these to your <code className="bg-muted px-1.5 py-0.5 rounded">.env</code> file:
            </p>
            <div className="space-y-2">
              <CopyableCode code='AUTH_PROVIDER="betterauth"' label="Auth provider" />
              <CopyableCode code='BETTER_AUTH_SECRET="your-secret-here"' label="Better Auth secret" />
              <CopyableCode code='BETTER_AUTH_URL="http://localhost:3000"' label="App URL" />
            </div>
          </div>

          <Tip>
            Better Auth works great with any database. Make sure your DATABASE_URL is set up first.
          </Tip>
        </div>
      )}
    </div>
  );
}

function PaymentProviderTabs({
  CopyableCode,
  Tip
}: {
  CopyableCode: React.FC<{ code: string; label: string }>;
  Tip: React.FC<{ children: React.ReactNode }>;
}) {
  const [activeProvider, setActiveProvider] = useState<'stripe' | 'lemonsqueezy' | 'polar'>('stripe');

  const providers = [
    { id: 'stripe' as const, name: 'Stripe', recommended: true },
    { id: 'lemonsqueezy' as const, name: 'LemonSqueezy' },
    { id: 'polar' as const, name: 'Polar' },
  ];

  return (
    <div className="space-y-4">
      {/* Provider Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => setActiveProvider(provider.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeProvider === provider.id
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {provider.name}
            {provider.recommended && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                Popular
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stripe */}
      {activeProvider === 'stripe' && (
        <div className="space-y-4">
          <div className="p-4 border-2 border-green-200 dark:border-green-900 rounded-lg bg-green-50 dark:bg-green-950/30">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Most popular choice!</strong> Stripe works worldwide and supports subscriptions, one-time payments, and more.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add these to your <code className="bg-muted px-1.5 py-0.5 rounded">.env</code> file:
            </p>
            <div className="space-y-2">
              <CopyableCode code='PAYMENT_PROVIDER="stripe"' label="Payment provider" />
              <CopyableCode code='STRIPE_SECRET_KEY="sk_test_..."' label="Secret key" />
              <CopyableCode code='STRIPE_PUBLISHABLE_KEY="pk_test_..."' label="Publishable key" />
              <CopyableCode code='STRIPE_WEBHOOK_SECRET="whsec_..."' label="Webhook secret" />
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Where to find these values?</h4>
            <p className="text-sm text-muted-foreground">
              Go to <strong>Stripe Dashboard → Developers → API keys</strong>. Use the test keys (starting with <code className="bg-muted px-1 rounded">sk_test_</code>) while developing.
            </p>
          </div>

          <Tip>
            Start with test mode! Use card number <code className="bg-muted px-1.5 py-0.5 rounded text-xs">4242 4242 4242 4242</code> with any future date and CVC to test payments.
          </Tip>
        </div>
      )}

      {/* LemonSqueezy */}
      {activeProvider === 'lemonsqueezy' && (
        <div className="space-y-4">
          <div className="p-4 border-2 border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50 dark:bg-amber-950/30">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Great for digital products!</strong> LemonSqueezy handles sales tax, VAT, and compliance automatically.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add these to your <code className="bg-muted px-1.5 py-0.5 rounded">.env</code> file:
            </p>
            <div className="space-y-2">
              <CopyableCode code='PAYMENT_PROVIDER="lemonsqueezy"' label="Payment provider" />
              <CopyableCode code='LEMONSQUEEZY_API_KEY="..."' label="API key" />
              <CopyableCode code='LEMONSQUEEZY_STORE_ID="..."' label="Store ID" />
              <CopyableCode code='LEMONSQUEEZY_WEBHOOK_SECRET="..."' label="Webhook secret" />
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Why LemonSqueezy?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Handles EU VAT automatically</li>
              <li>• No need for a business entity to start</li>
              <li>• Built-in affiliate system</li>
            </ul>
          </div>
        </div>
      )}

      {/* Polar */}
      {activeProvider === 'polar' && (
        <div className="space-y-4">
          <div className="p-4 border-2 border-blue-200 dark:border-blue-900 rounded-lg bg-blue-50 dark:bg-blue-950/30">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Perfect for developers!</strong> Polar is built for open source monetization and developer tools.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add these to your <code className="bg-muted px-1.5 py-0.5 rounded">.env</code> file:
            </p>
            <div className="space-y-2">
              <CopyableCode code='PAYMENT_PROVIDER="polar"' label="Payment provider" />
              <CopyableCode code='POLAR_ACCESS_TOKEN="..."' label="Access token" />
              <CopyableCode code='POLAR_WEBHOOK_SECRET="..."' label="Webhook secret" />
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Why Polar?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• GitHub-native sponsorship alternative</li>
              <li>• Great for open source projects</li>
              <li>• Simple subscription management</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function AIProviderTabs({
  CopyableCode,
  Tip
}: {
  CopyableCode: React.FC<{ code: string; label: string }>;
  Tip: React.FC<{ children: React.ReactNode }>;
}) {
  const [activeProvider, setActiveProvider] = useState<'openrouter' | 'openai' | 'anthropic'>('openrouter');

  const providers = [
    { id: 'openrouter' as const, name: 'OpenRouter', recommended: true },
    { id: 'openai' as const, name: 'OpenAI' },
    { id: 'anthropic' as const, name: 'Anthropic' },
  ];

  return (
    <div className="space-y-4">
      {/* Provider Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => setActiveProvider(provider.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeProvider === provider.id
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {provider.name}
            {provider.recommended && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                Best Value
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OpenRouter */}
      {activeProvider === 'openrouter' && (
        <div className="space-y-4">
          <div className="p-4 border-2 border-green-200 dark:border-green-900 rounded-lg bg-green-50 dark:bg-green-950/30">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Access 100+ AI models with one API key!</strong> Use GPT-4, Claude, Llama, Mistral, and more. Pay only for what you use.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add these to your <code className="bg-muted px-1.5 py-0.5 rounded">.env</code> file:
            </p>
            <div className="space-y-2">
              <CopyableCode code='AI_PROVIDER="openrouter"' label="AI provider" />
              <CopyableCode code='OPENROUTER_API_KEY="sk-or-..."' label="API key" />
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Why OpenRouter?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• $1 free credit to start</li>
              <li>• Switch between models without code changes</li>
              <li>• Often cheaper than direct API access</li>
              <li>• Automatic fallbacks if a model is down</li>
            </ul>
          </div>

          <Tip>
            Create an account at <strong>openrouter.ai</strong> and get your API key from the dashboard. The free credit is enough for thousands of requests!
          </Tip>
        </div>
      )}

      {/* OpenAI */}
      {activeProvider === 'openai' && (
        <div className="space-y-4">
          <div className="p-4 border-2 border-emerald-200 dark:border-emerald-900 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              <strong>Direct access to GPT-4, GPT-4o, and DALL-E!</strong> The most widely used AI API with extensive documentation.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add these to your <code className="bg-muted px-1.5 py-0.5 rounded">.env</code> file:
            </p>
            <div className="space-y-2">
              <CopyableCode code='AI_PROVIDER="openai"' label="AI provider" />
              <CopyableCode code='OPENAI_API_KEY="sk-..."' label="API key" />
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Available Models</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>gpt-4o</strong> - Fast and smart, best for most tasks</li>
              <li>• <strong>gpt-4-turbo</strong> - More capable, higher cost</li>
              <li>• <strong>gpt-3.5-turbo</strong> - Cheap and fast</li>
            </ul>
          </div>

          <Tip>
            Get your API key at <strong>platform.openai.com</strong>. New accounts get free credits to start!
          </Tip>
        </div>
      )}

      {/* Anthropic */}
      {activeProvider === 'anthropic' && (
        <div className="space-y-4">
          <div className="p-4 border-2 border-orange-200 dark:border-orange-900 rounded-lg bg-orange-50 dark:bg-orange-950/30">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>Claude is great for coding and long documents!</strong> Known for being helpful, harmless, and honest.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add these to your <code className="bg-muted px-1.5 py-0.5 rounded">.env</code> file:
            </p>
            <div className="space-y-2">
              <CopyableCode code='AI_PROVIDER="anthropic"' label="AI provider" />
              <CopyableCode code='ANTHROPIC_API_KEY="sk-ant-..."' label="API key" />
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Available Models</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>claude-3-5-sonnet</strong> - Best balance of speed and quality</li>
              <li>• <strong>claude-3-opus</strong> - Most capable, for complex tasks</li>
              <li>• <strong>claude-3-haiku</strong> - Fastest, great for simple tasks</li>
            </ul>
          </div>

          <Tip>
            Get your API key at <strong>console.anthropic.com</strong>. Claude excels at coding, analysis, and writing tasks!
          </Tip>
        </div>
      )}
    </div>
  );
}

function VibeStepContent({
  Tip
}: {
  Tip: React.FC<{ children: React.ReactNode }>;
}) {
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateAdmin = async () => {
    if (!adminName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (adminPassword.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }
    if (!/[a-z]/.test(adminPassword)) {
      setError('Password must contain a lowercase letter');
      return;
    }
    if (!/[A-Z]/.test(adminPassword)) {
      setError('Password must contain an uppercase letter');
      return;
    }
    if (!/[0-9]/.test(adminPassword)) {
      setError('Password must contain a number');
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(adminPassword)) {
      setError('Password must contain a special character');
      return;
    }

    setError('');
    setIsCreating(true);

    try {
      // Call the setup-admin API to create a real admin user
      const response = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create admin account');
        setIsCreating(false);
        return;
      }

      // Mark setup as complete
      localStorage.setItem('shipkit-admin-created', 'true');

      toast.success('Admin account created! Redirecting to login...');

      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (err) {
      console.error('Admin creation error:', err);
      setError('Failed to create admin account. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Vibe Your App!</h3>
        <p className="text-muted-foreground">
          Create your admin account and start building something amazing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[65%_35%] gap-6">
        {/* Create Admin Account - Left Column (65%) */}
        <div className="space-y-4 p-5 border-2 border-primary/20 rounded-xl bg-primary/5">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Create Admin Account</h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Your Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Email Address</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@yourapp.com"
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Min 12 chars, uppercase, lowercase, number, special char</p>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button
              onClick={handleCreateAdmin}
              disabled={isCreating}
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Create Admin & Start Vibing
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Pre-Vibe Checklist - Right Column (35%) */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Pre-Vibe Checklist
          </h4>
          <div className="space-y-2">
            {[
              'Database configured',
              'Authentication ready',
              'Payments set up',
              'AI features enabled',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          <Tip>
            This creates your first admin account. You can invite more team members later from the dashboard.
          </Tip>
        </div>
      </div>
    </div>
  );
}

function StepContent({
  step,
  stepNumber,
  onComplete,
  onNext,
  onPrev,
  isFirst,
  isLast,
  totalSteps,
}: {
  step: SetupStep;
  stepNumber: number;
  onComplete: () => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  totalSteps: number;
}) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const CopyableCode = ({ code, label }: { code: string; label: string }) => (
    <button
      onClick={() => copyToClipboard(code, label)}
      className="group flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 px-3 py-2 rounded-lg text-sm font-mono transition-colors w-full text-left"
    >
      <code className="flex-1 truncate">{code}</code>
      <Copy className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
    </button>
  );

  const Tip = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
      <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
      <p className="text-sm text-amber-800 dark:text-amber-200">{children}</p>
    </div>
  );

  const ServiceButton = ({ name, url, description, free }: { name: string; url: string; description: string; free?: boolean }) => (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          {free && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
              Free tier
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
    </a>
  );

  const content: Record<string, React.ReactNode> = {
    database: (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Connect Your Database</h3>
          <p className="text-muted-foreground">
            Your app needs a place to store data. We recommend starting with a free cloud database.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Choose a Free Database Provider
          </h4>
          <div className="grid gap-3">
            <ServiceButton
              name="Supabase"
              url="https://supabase.com"
              description="Easiest to set up, includes auth & storage"
              free
            />
            <ServiceButton
              name="Neon"
              url="https://neon.tech"
              description="Serverless Postgres, very fast"
              free
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            What to Do
          </h4>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
              <span>Sign up for Supabase or Neon (takes 2 minutes)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
              <span>Create a new project and copy your database URL</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
              <div className="space-y-2 flex-1">
                <span>Add this line to your <code className="bg-muted px-1.5 py-0.5 rounded text-sm">.env</code> file:</span>
                <CopyableCode
                  code='DATABASE_URL="postgresql://user:password@host:5432/db"'
                  label="Database URL template"
                />
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span>
              <div className="space-y-2 flex-1">
                <span>Run this command in your terminal:</span>
                <CopyableCode code="npx prisma db push" label="Command" />
              </div>
            </li>
          </ol>
        </div>

        <Tip>
          Don&apos;t have the .env file? Create one in your project root folder. Your AI assistant can help you with this!
        </Tip>
      </div>
    ),

    auth: (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Set Up User Login</h3>
          <p className="text-muted-foreground">
            Let users create accounts and sign in. Choose your preferred authentication provider.
          </p>
        </div>

        <AuthProviderTabs CopyableCode={CopyableCode} Tip={Tip} />
      </div>
    ),

    payments: (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Accept Payments</h3>
          <p className="text-muted-foreground">
            Start accepting payments from customers. Choose your preferred payment provider.
          </p>
        </div>

        <PaymentProviderTabs CopyableCode={CopyableCode} Tip={Tip} />
      </div>
    ),

    ai: (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Add AI Features</h3>
          <p className="text-muted-foreground">
            Power your app with ChatGPT, Claude, Llama, or other AI models. Choose your preferred provider.
          </p>
        </div>

        <AIProviderTabs CopyableCode={CopyableCode} Tip={Tip} />
      </div>
    ),

    launch: (
      <VibeStepContent Tip={Tip} />
    ),
  };

  return (
    <div className="space-y-6">
      {content[step.id]}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={isFirst}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Step {stepNumber} of {totalSteps}
        </span>

        <div className="flex gap-2">
          {!step.isComplete && (
            <Button variant="outline" onClick={onComplete} className="gap-2">
              <Check className="h-4 w-4" />
              Mark Complete
            </Button>
          )}
          <Button onClick={isLast ? onComplete : onNext} className="gap-2">
            {isLast ? 'Finish Setup' : 'Next Step'}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
