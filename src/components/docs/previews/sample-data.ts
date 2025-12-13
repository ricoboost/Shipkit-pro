/**
 * Sample data for component previews
 */

import type { TestimonialItem, FAQItem, PricingTier, StatItem } from '@/components/marketing/types';

// Testimonials sample data
export const sampleTestimonials: TestimonialItem[] = [
  {
    content: "ShipKit saved us weeks of development time. The code quality is excellent and the documentation is comprehensive.",
    author: {
      name: "Sarah Chen",
      title: "CTO",
      company: "TechCorp",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    rating: 5
  },
  {
    content: "The best SaaS starter kit I've ever used. Everything just works out of the box.",
    author: {
      name: "Michael Johnson",
      title: "Founder",
      company: "StartupXYZ",
      avatar: "https://i.pravatar.cc/150?u=michael"
    },
    rating: 5
  },
  {
    content: "Incredible developer experience. The components are well-designed and easy to customize.",
    author: {
      name: "Emily Rodriguez",
      title: "Lead Developer",
      company: "DevStudio",
      avatar: "https://i.pravatar.cc/150?u=emily"
    },
    rating: 5
  },
  {
    content: "We launched our MVP in just 2 weeks thanks to ShipKit. Highly recommended!",
    author: {
      name: "David Kim",
      title: "Product Manager",
      company: "InnovateCo",
      avatar: "https://i.pravatar.cc/150?u=david"
    },
    rating: 5
  },
];

// FAQ sample data
export const sampleFAQs: FAQItem[] = [
  {
    question: "How do I get started?",
    answer: "Simply sign up for a free account and follow our quick start tutorial. You'll be up and running in minutes."
  },
  {
    question: "What's the refund policy?",
    answer: "We offer a 30-day money-back guarantee. If you're not satisfied, contact support for a full refund."
  },
  {
    question: "Do you offer team discounts?",
    answer: "Yes, we offer volume pricing for teams of 5 or more. Contact sales for a custom quote."
  },
  {
    question: "Can I use this for commercial projects?",
    answer: "Absolutely! All licenses include full commercial usage rights with no restrictions."
  },
  {
    question: "What support is included?",
    answer: "All plans include access to our Discord community and documentation. Pro plans include priority email support."
  },
];

// Pricing tiers sample data
export const samplePricingTiers: PricingTier[] = [
  {
    name: "Free",
    description: "Perfect for side projects",
    price: { monthly: 0, yearly: 0 },
    features: [
      "Up to 3 projects",
      "Basic analytics",
      "Community support",
      "1GB storage"
    ],
    ctaLabel: "Get Started",
    ctaHref: "#"
  },
  {
    name: "Pro",
    description: "For serious developers",
    price: { monthly: 29, yearly: 290 },
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "10GB storage",
      "Custom domains",
      "API access"
    ],
    ctaLabel: "Start Trial",
    ctaHref: "#",
    highlighted: true
  },
  {
    name: "Enterprise",
    description: "For large teams",
    price: { monthly: 99, yearly: 990 },
    features: [
      "Everything in Pro",
      "SSO & SAML",
      "Dedicated support",
      "100GB storage",
      "Custom integrations",
      "SLA guarantee"
    ],
    ctaLabel: "Contact Sales",
    ctaHref: "#"
  },
];

// Stats sample data
export const sampleStats: StatItem[] = [
  { value: "10K+", label: "Active Users" },
  { value: "500+", label: "Companies" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

// Features sample data
export const sampleFeatures = [
  {
    title: "Lightning Fast",
    description: "Built for speed with the latest web technologies and optimizations."
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade security with SOC2 compliance and encryption at rest."
  },
  {
    title: "Easy Integration",
    description: "Connect with your favorite tools in minutes, not days."
  },
  {
    title: "Scalable",
    description: "Grows with your business from startup to enterprise."
  },
  {
    title: "24/7 Support",
    description: "Our team is always available to help you succeed."
  },
  {
    title: "Analytics",
    description: "Deep insights into your users and business metrics."
  },
];

// Problem/Solution sample data
export const samplePainPoints = [
  {
    title: "Endless Configuration",
    description: "Hours spent setting up tools instead of building features. Every new project feels like starting from scratch."
  },
  {
    title: "Hidden Costs Add Up",
    description: "Premium themes, plugins, and services quickly exceed your budget. The 'free' solution becomes expensive."
  },
  {
    title: "Technical Debt Accumulates",
    description: "Quick fixes become permanent problems. Your codebase becomes harder to maintain over time."
  },
];

export const sampleTransformations = [
  { before: "Hours configuring auth", after: "Auth ready in 5 minutes" },
  { before: "Manual payment setup", after: "Stripe pre-configured" },
  { before: "Building UI from scratch", after: "50+ polished components" },
  { before: "Weeks before launch", after: "Launch in days" },
];

// Comparison sample data
export const sampleWithWithout = {
  withoutItems: [
    "Spending weeks on boilerplate",
    "Debugging authentication issues",
    "Wrestling with payment integrations",
    "Building components from scratch",
    "Delayed launches"
  ],
  withItems: [
    "Production-ready in hours",
    "Auth that just works",
    "Stripe pre-configured",
    "50+ polished components",
    "Launch with confidence"
  ]
};

export const sampleCompetitors = [
  { name: "ShipKit", highlighted: true, badge: "Best Value" },
  { name: "Build from Scratch" },
  { name: "Competitor A" },
];

export const sampleComparisonFeatures = [
  { category: "Core", name: "Authentication", values: [true, false, true] },
  { category: "Core", name: "Payments", values: [true, false, true] },
  { category: "Core", name: "Email System", values: [true, false, false] },
  { category: "Components", name: "UI Components", values: ["50+", "0", "20+"] },
  { category: "Components", name: "Marketing Sections", values: ["30+", "0", "10"] },
  { category: "Support", name: "Documentation", values: [true, false, true] },
  { category: "Pricing", name: "One-time Payment", values: [true, true, false] },
];

// Logo sample data
export const sampleLogos = [
  { name: "Vercel", src: "https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png" },
  { name: "Next.js", src: "https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_dark_background.png" },
  { name: "React", src: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" },
  { name: "TypeScript", src: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" },
  { name: "Tailwind", src: "https://tailwindcss.com/_next/static/media/tailwindcss-mark.3c5441fc7a190fb1800d4a5c7f07ba4b1345a9c8.svg" },
  { name: "Prisma", src: "https://prismalens.vercel.app/header/logo-white.svg" },
];
