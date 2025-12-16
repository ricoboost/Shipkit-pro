'use client';

/**
 * Admin Account Step
 * Create admin account with real-time password validation
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useWizard } from '../wizard-context';
import { WizardNavigation } from '../wizard-navigation';
import { fadeInVariants, staggerContainer } from '../constants';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (p) => p.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'number',
    label: 'One number',
    test: (p) => /[0-9]/.test(p),
  },
  {
    id: 'special',
    label: 'One special character (!@#$%^&*)',
    test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

export function AdminStep() {
  const { nextStep, markComplete } = useWizard();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Field-level errors
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  // Password validation
  const passwordChecks = useMemo(() => {
    return passwordRequirements.map((req) => ({
      ...req,
      passed: req.test(password),
    }));
  }, [password]);

  const allPasswordRequirementsMet = passwordChecks.every((check) => check.passed);
  const passwordStrength = passwordChecks.filter((check) => check.passed).length;

  // Get strength bar color
  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-muted';
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-yellow-500';
    if (passwordStrength <= 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Field validation
  const nameError = touched.name && name.length < 2 ? 'Name must be at least 2 characters' : '';
  const emailError =
    touched.email && (!email.includes('@') || email.length < 5)
      ? 'Please enter a valid email'
      : '';

  const canSubmit =
    name.length >= 2 &&
    email.includes('@') &&
    email.length >= 5 &&
    allPasswordRequirementsMet &&
    !isSubmitting;

  const handleSubmit = async () => {
    setError('');
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

      markComplete('admin', { data: { email } });
      toast.success('Admin account created!');
      nextStep();
    } catch (err) {
      console.error('Admin creation error:', err);
      setError('Failed to create admin account. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6 lg:p-12 overflow-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeInVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Step 3 of 4</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4">
              Create your admin account
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              This will be your login to manage everything.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div variants={fadeInVariants} className="space-y-5">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Your Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="John Doe"
                className={`mt-1.5 ${nameError ? 'border-red-500' : ''}`}
              />
              {nameError && (
                <p className="text-xs text-red-500 mt-1">{nameError}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="admin@yourapp.com"
                className={`mt-1.5 ${emailError ? 'border-red-500' : ''}`}
              />
              {emailError && (
                <p className="text-xs text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            {/* Password */}
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
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="Create a strong password"
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

              {/* Password Strength Bar */}
              <div className="mt-3">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4].map((segment) => (
                    <div
                      key={segment}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        passwordStrength >= segment ? getStrengthColor() : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {passwordStrength === 0 && 'Enter a password'}
                  {passwordStrength === 1 && 'Weak'}
                  {passwordStrength === 2 && 'Fair'}
                  {passwordStrength === 3 && 'Good'}
                  {passwordStrength === 4 && 'Strong'}
                </p>
              </div>

              {/* Password Requirements Checklist */}
              <div className="mt-4 space-y-1.5">
                {passwordChecks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    {check.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/50" />
                    )}
                    <span
                      className={
                        check.passed ? 'text-green-600' : 'text-muted-foreground'
                      }
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full gap-2"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  Create Admin Account
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You can invite team members later from the dashboard.
            </p>
          </motion.div>
        </motion.div>
      </div>

      <WizardNavigation nextDisabled={true} />
    </div>
  );
}
