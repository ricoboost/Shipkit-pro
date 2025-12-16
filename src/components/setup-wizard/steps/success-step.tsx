'use client';

/**
 * Success Step
 * Celebration and clear next steps with equal-weight action cards
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Rocket,
  FileEdit,
  Palette,
  LayoutDashboard,
  BookOpen,
  ExternalLink,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { fadeInVariants, staggerContainer } from '../constants';

const actionCards = [
  {
    id: 'waitlist',
    icon: FileEdit,
    title: 'Build Your Waitlist',
    description: 'Create a landing page to collect early signups',
    cta: 'Start Building',
    href: '/admin/waitlist/editor',
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-500',
  },
  {
    id: 'theme',
    icon: Palette,
    title: 'Customize Your Theme',
    description: 'Set colors, logo, and branding',
    cta: 'Customize',
    href: '/admin/theme',
    color: 'from-purple-500/20 to-purple-600/10',
    iconColor: 'text-purple-500',
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Explore Dashboard',
    description: 'See analytics and manage users',
    cta: 'Open Dashboard',
    href: '/admin',
    color: 'from-green-500/20 to-green-600/10',
    iconColor: 'text-green-500',
  },
];

const secondaryLinks = [
  {
    label: 'Read Documentation',
    href: '/docs',
    icon: BookOpen,
  },
  {
    label: 'Visit Homepage',
    href: '/',
    icon: Home,
  },
  {
    label: 'GitHub Repository',
    href: 'https://github.com',
    icon: ExternalLink,
    external: true,
  },
];

export function SuccessStep() {
  // Fire confetti on mount
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#8b5cf6'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Also burst in center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors,
    });
  }, []);

  return (
    <div className="h-full flex flex-col p-6 lg:p-12 overflow-auto">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full"
      >
        {/* Celebration Header */}
        <motion.div
          variants={fadeInVariants}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 mb-6"
          >
            <Rocket className="h-10 w-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-foreground mb-4">
            Your app is ready!
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Setup complete. Choose what you&apos;d like to do next.
          </p>
        </motion.div>

        {/* Action Cards - 3 Equal Weight */}
        <motion.div
          variants={fadeInVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10"
        >
          {actionCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link
                href={card.href}
                className="block h-full p-6 rounded-2xl border bg-gradient-to-br hover:border-primary/50 hover:shadow-lg transition-all group"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                }}
              >
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {card.description}
                </p>
                <Button size="sm" className="w-full">
                  {card.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Secondary Links */}
        <motion.div
          variants={fadeInVariants}
          className="flex flex-wrap justify-center gap-3"
        >
          {secondaryLinks.map((link) => (
            <Button
              key={link.label}
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className="gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )}
            </Button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
