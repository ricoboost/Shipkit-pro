'use client';

/**
 * Launch Step
 * Create admin account and launch the application
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Rocket,
  CheckCircle2,
  Terminal,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useWizard } from '../wizard-context';
import { WizardNavigation } from '../wizard-navigation';
import { TipBlock } from '../components/tip-block';
import { fadeInVariants, staggerContainer, WIZARD_STEPS } from '../constants';

export function LaunchStep() {
  const router = useRouter();
  const { state, markComplete } = useWizard();
  const [isComplete, setIsComplete] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fire confetti on completion
  useEffect(() => {
    if (isComplete) {
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ['#6366f1', '#22c55e', '#f59e0b'];

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
    }
  }, [isComplete]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain a lowercase letter');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain an uppercase letter');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain a number');
      return false;
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      setError('Password must contain a special character');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create admin account');
        setIsSubmitting(false);
        return;
      }

      markComplete('launch');
      setIsComplete(true);
      toast.success('Admin account created! Redirecting...');

      // Redirect to dashboard after confetti
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error('Admin creation error:', err);
      setError('Failed to create admin account. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Get completed steps summary
  const summary = WIZARD_STEPS.filter((step) =>
    state.completedSteps.includes(step.id)
  );

  if (isComplete) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 lg:p-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-3xl bg-primary/20 mb-6">
            <Rocket className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            You&apos;re all set!
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
            Your SaaS application is configured and ready to launch. Redirecting
            to login...
          </p>

          {/* Completed Items */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
            {summary.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {step.title} configured
                </span>
              </div>
            ))}
          </div>

          {/* Run command */}
          <div className="p-6 rounded-2xl bg-zinc-900 text-white max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="h-5 w-5" />
              <span className="font-medium">Run your development server</span>
            </div>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
              <span className="text-zinc-500">$</span> npm run dev
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-8 lg:p-16 overflow-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          {/* Header */}
          <motion.div variants={fadeInVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Rocket className="h-4 w-4" />
              <span className="text-sm font-medium">Step 6 of 6</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Create admin account
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Create your admin account to access the dashboard and manage your
              application.
            </p>
          </motion.div>

          {/* Setup Summary */}
          <motion.div variants={fadeInVariants} className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Setup Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {WIZARD_STEPS.slice(1, -1).map((step) => {
                const isConfigured = state.completedSteps.includes(step.id);
                const wasSkipped = state.stepData[step.id]?.skipped;
                return (
                  <div
                    key={step.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
                  >
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        isConfigured
                          ? wasSkipped
                            ? 'text-muted-foreground'
                            : 'text-green-500'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                    <span className="text-sm">
                      {step.title}
                      {wasSkipped && (
                        <span className="text-muted-foreground"> (skipped)</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Admin Form */}
          <motion.div
            variants={fadeInVariants}
            className="space-y-4 p-6 rounded-2xl border-2 border-primary/20 bg-primary/5"
          >
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Your Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourapp.com"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 12 characters"
                  className="pr-10"
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
              <p className="text-xs text-muted-foreground mt-1">
                Min 12 chars, uppercase, lowercase, number, special character
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full gap-2"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Create Admin & Launch
                </>
              )}
            </Button>
          </motion.div>

          {/* Tip */}
          <motion.div variants={fadeInVariants} className="mt-6">
            <TipBlock variant="info">
              This creates your first admin account. You can invite more team
              members later from the dashboard.
            </TipBlock>
          </motion.div>
        </motion.div>
      </div>

      <WizardNavigation nextDisabled={true} />
    </div>
  );
}
