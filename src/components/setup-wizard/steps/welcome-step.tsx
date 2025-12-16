'use client';

/**
 * Welcome Step - Interactive Preview
 * Shows users what they're building with tabbed previews
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Play,
  LayoutDashboard,
  FileEdit,
  Palette,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWizard } from '../wizard-context';
import { useDemoContext } from '@/components/providers/demo-provider';
import { fadeInVariants, staggerContainer } from '../constants';

const previewTabs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Analytics, user management, and insights',
  },
  {
    id: 'waitlist',
    label: 'Waitlist Builder',
    icon: FileEdit,
    description: 'Visual editor for your landing page',
  },
  {
    id: 'theme',
    label: 'Theme Editor',
    icon: Palette,
    description: 'Customize colors and branding',
  },
];

const features = [
  'Full admin dashboard with analytics',
  'Visual waitlist page builder',
  'Theme customization',
  'User & subscription management',
  'AI playground integration',
  '7 languages supported',
];

export function WelcomeStep() {
  const router = useRouter();
  const { nextStep, markComplete } = useWizard();
  const { enable: enableDemo } = useDemoContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleGetStarted = () => {
    markComplete('welcome');
    nextStep();
  };

  const handleSkipToDemo = () => {
    enableDemo();
    router.push('/dashboard');
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-12">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-12"
      >
        {/* Left Column - Text Content */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Badge */}
          <motion.div variants={fadeInVariants} className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Welcome to ShipKit</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeInVariants}
            className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-foreground mb-4"
          >
            Your SaaS is
            <br />
            <span className="text-primary">ready to launch</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeInVariants}
            className="text-lg text-muted-foreground leading-relaxed mb-6"
          >
            Explore what you&apos;re getting, then complete a quick setup to make it yours.
          </motion.p>

          {/* Quick Features List */}
          <motion.div variants={fadeInVariants} className="mb-8">
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Time Estimate */}
          <motion.div
            variants={fadeInVariants}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
          >
            <Clock className="h-4 w-4" />
            <span>Setup takes about 3 minutes</span>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={fadeInVariants}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Start Setup
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleSkipToDemo}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Explore Demo First
            </Button>
          </motion.div>
        </div>

        {/* Right Column - Interactive Preview */}
        <motion.div
          variants={fadeInVariants}
          className="flex-1 flex flex-col min-h-[400px] lg:min-h-0"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              {previewTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Dashboard Preview */}
            <TabsContent value="dashboard" className="flex-1 mt-0">
              <div className="h-full rounded-xl border bg-card overflow-hidden shadow-lg">
                <div className="p-4 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs text-muted-foreground">Admin Dashboard</span>
                  </div>
                </div>
                <div className="p-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'Users', value: '1,234', change: '+12%' },
                      { label: 'Revenue', value: '$5,678', change: '+8%' },
                      { label: 'Active', value: '89%', change: '+3%' },
                    ].map((stat) => (
                      <div key={stat.label} className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-xs text-green-500">{stat.change}</p>
                      </div>
                    ))}
                  </div>
                  {/* Chart Placeholder */}
                  <div className="h-32 rounded-lg bg-gradient-to-r from-primary/20 to-primary/5 flex items-end justify-around p-4">
                    {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                      <div
                        key={i}
                        className="w-6 bg-primary/60 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Waitlist Builder Preview */}
            <TabsContent value="waitlist" className="flex-1 mt-0">
              <div className="h-full rounded-xl border bg-card overflow-hidden shadow-lg">
                <div className="p-4 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs text-muted-foreground">Waitlist Page Builder</span>
                  </div>
                </div>
                <div className="p-6 flex gap-4">
                  {/* Sidebar */}
                  <div className="w-1/4 space-y-2">
                    {['Hero', 'Features', 'CTA', 'Footer'].map((section) => (
                      <div key={section} className="p-2 rounded bg-muted/50 text-xs">
                        {section}
                      </div>
                    ))}
                  </div>
                  {/* Canvas */}
                  <div className="flex-1 rounded-lg border-2 border-dashed border-primary/30 p-4">
                    <div className="text-center space-y-3">
                      <div className="h-6 w-32 mx-auto rounded bg-primary/20" />
                      <div className="h-4 w-48 mx-auto rounded bg-muted" />
                      <div className="h-4 w-40 mx-auto rounded bg-muted" />
                      <div className="flex justify-center gap-2 mt-4">
                        <div className="h-8 w-24 rounded bg-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Theme Editor Preview */}
            <TabsContent value="theme" className="flex-1 mt-0">
              <div className="h-full rounded-xl border bg-card overflow-hidden shadow-lg">
                <div className="p-4 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs text-muted-foreground">Theme Customization</span>
                  </div>
                </div>
                <div className="p-6">
                  {/* Color Swatches */}
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground mb-2">Primary Color</p>
                    <div className="flex gap-2">
                      {['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map((color) => (
                        <div
                          key={color}
                          className="h-8 w-8 rounded-lg cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-primary transition-all"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Preview Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border">
                      <div className="h-3 w-16 rounded bg-primary mb-2" />
                      <div className="h-2 w-24 rounded bg-muted" />
                    </div>
                    <div className="p-4 rounded-lg bg-primary text-primary-foreground">
                      <div className="h-3 w-16 rounded bg-white/30 mb-2" />
                      <div className="h-2 w-24 rounded bg-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Tab Description */}
          <motion.p
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-muted-foreground mt-4"
          >
            {previewTabs.find((t) => t.id === activeTab)?.description}
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
