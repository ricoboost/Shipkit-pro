'use client';

/**
 * Welcome Step
 * Introduction to the setup wizard with feature highlights
 */

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, Zap, Shield, Globe, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizard } from '../wizard-context';
import { useDemoContext } from '@/components/providers/demo-provider';
import { fadeInVariants, staggerContainer } from '../constants';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Pre-configured with optimized settings for production',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'Built-in authentication and security best practices',
  },
  {
    icon: Globe,
    title: 'Deploy Anywhere',
    description: 'Works with Vercel, Railway, or any Node.js host',
  },
];

export function WelcomeStep() {
  const router = useRouter();
  const { nextStep, markComplete } = useWizard();
  const { enable: enableDemo } = useDemoContext();

  const handleGetStarted = () => {
    markComplete('welcome');
    nextStep();
  };

  const handleSkipToDemo = () => {
    enableDemo();
    router.push('/dashboard');
  };

  return (
    <div className="h-full flex flex-col p-8 lg:p-16">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col justify-center max-w-2xl"
      >
        {/* Badge */}
        <motion.div variants={fadeInVariants} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Welcome to ShipKit</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeInVariants}
          className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4"
        >
          Let&apos;s set up your
          <br />
          <span className="text-primary">SaaS application</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={fadeInVariants}
          className="text-lg text-muted-foreground leading-relaxed mb-8"
        >
          We&apos;ll guide you through a few simple steps to get your
          application up and running. This wizard will help you configure your
          database, authentication, payments, and more.
        </motion.p>

        {/* Feature Cards */}
        <motion.div variants={fadeInVariants} className="grid gap-4 mb-8">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInVariants}
              whileHover={{ scale: 1.02, x: 8 }}
              className="flex items-start gap-4 p-5 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </motion.div>
          ))}
        </motion.div>

        {/* Help Box */}
        <motion.div
          variants={fadeInVariants}
          className="p-6 rounded-2xl bg-muted/50 border border-dashed mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">
                Estimated time: ~5 minutes
              </h4>
              <p className="text-sm text-muted-foreground">
                AI assistance is available at each step. Look for the sparkle
                icon to get contextual help from Claude, Cursor, or Copilot.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={fadeInVariants}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleSkipToDemo}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Skip to Demo
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
