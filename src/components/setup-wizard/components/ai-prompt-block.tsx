'use client';

/**
 * AI Prompt Block
 * Collapsible section with copyable AI assistant prompts
 */

import { useState } from 'react';
import { Sparkles, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AIPromptBlockProps {
  stepId: string;
  className?: string;
}

const AI_PROMPTS: Record<string, string> = {
  database: `Help me connect a PostgreSQL database to my ShipKit project.

I need you to:
1. Suggest a free database provider (Supabase or Neon)
2. Help me create the database and get the connection URL
3. Add the DATABASE_URL to my .env file
4. Run "npx prisma db push" to set up the schema

Please guide me step by step.`,

  auth: `Help me set up user authentication in my ShipKit project.

I want to configure the auth provider I've selected.

Please:
1. Show me what environment variables I need
2. Help me find the values in my provider dashboard
3. Add them to my .env file
4. Verify the auth is working

Guide me step by step.`,

  payments: `Help me set up payment processing in my ShipKit project.

I want to use the payment provider I've selected.

Please:
1. Help me create an account if needed
2. Get my API keys (test mode first)
3. Add the environment variables to my .env file
4. Set up the webhook endpoint

Guide me step by step.`,

  ai: `Help me add AI features to my ShipKit project.

I want to use the AI provider I've selected.

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

export function AIPromptBlock({ stepId, className }: AIPromptBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const prompt = AI_PROMPTS[stepId];
  if (!prompt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success('Prompt copied! Paste it into your AI coding assistant');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-primary/30 bg-primary/5',
        className
      )}
    >
      {/* Header (always visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Need help from AI?</h4>
            <p className="text-xs text-muted-foreground">
              Copy this prompt for Claude, Cursor, or Copilot
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="relative">
                <div className="bg-zinc-900 text-zinc-300 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
                  {prompt}
                </div>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="absolute top-3 right-3 gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
