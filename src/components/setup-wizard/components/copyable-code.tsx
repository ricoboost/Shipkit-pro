'use client';

/**
 * Copyable Code
 * Code snippet with copy-to-clipboard functionality
 */

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CopyableCodeProps {
  code: string;
  label?: string;
  className?: string;
}

export function CopyableCode({ code, label, className }: CopyableCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(label ? `${label} copied!` : 'Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'group flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 px-4 py-3 rounded-lg text-sm font-mono transition-colors w-full text-left',
        className
      )}
    >
      <code className="flex-1 truncate">{code}</code>
      <span className="shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-colors">
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </span>
    </button>
  );
}
