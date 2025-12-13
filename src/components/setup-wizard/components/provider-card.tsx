'use client';

/**
 * Provider Card
 * Selectable card for choosing a provider (database, auth, payments, AI)
 */

import { motion } from 'framer-motion';
import { Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Provider } from '../constants';

interface ProviderCardProps {
  provider: Provider;
  isSelected: boolean;
  onSelect: () => void;
}

export function ProviderCard({
  provider,
  isSelected,
  onSelect,
}: ProviderCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={cn(
        'relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-300',
        isSelected
          ? 'border-primary bg-primary/5 shadow-lg'
          : 'border-border bg-card hover:border-primary/30'
      )}
    >
      {/* Recommended Badge */}
      {provider.recommended && (
        <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
          Recommended
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Provider Name + Selection Check */}
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground">
              {provider.name}
            </h3>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="h-6 w-6 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="h-4 w-4 text-primary-foreground" />
              </motion.div>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-4">{provider.description}</p>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {provider.features.map((feature) => (
              <span
                key={feature}
                className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Selection Radio */}
        <div className="shrink-0">
          <div
            className={cn(
              'h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center',
              isSelected
                ? 'border-primary bg-primary'
                : 'border-muted-foreground/30'
            )}
          >
            {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
          </div>
        </div>
      </div>

      {/* External Link (if URL provided) */}
      {provider.url && (
        <a
          href={provider.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </motion.button>
  );
}
