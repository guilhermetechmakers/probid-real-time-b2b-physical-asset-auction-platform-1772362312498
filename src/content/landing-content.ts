export interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

export interface Step {
  id: string
  stepNumber: number
  title: string
  description: string
  icon: string
}

export interface Tier {
  id: string
  name: string
  description: string
  price: string
  cta: string
}

export interface CTAConfig {
  label: string
  href: string
}

export interface HeroContent {
  title: string
  subtitle: string
  ctaPrimary: CTAConfig
  ctaSecondary: CTAConfig
  media?: string
}

export interface FooterSection {
  title: string
  links: { label: string; href: string }[]
}

export interface LandingContent {
  hero: HeroContent
  features: Feature[]
  howItWorks: Step[]
  pricingTeaser: Tier[]
  trustLogos: string[]
  footerSections: FooterSection[]
}

export const landingContent: LandingContent = {
  hero: {
    title: 'Real-Time B2B Auctions for Physical Assets',
    subtitle:
      'Intelligent intake, AI-powered QA, and a correctness-first auction engine. Enterprise-grade platform for sellers and buyers.',
    ctaPrimary: { label: 'Create Listing', href: '/signup' },
    ctaSecondary: { label: 'Explore', href: '/learn-more' },
  },
  features: [
    {
      id: 'intake-ai',
      title: 'Intelligent Intake + AI Vision QA',
      description:
        'Identifier-driven enrichment and pluggable AI vision pipeline for photo validation. Structured QA outputs with hard fails, warnings, and evidence for ops review.',
      icon: 'camera',
    },
    {
      id: 'realtime-auctions',
      title: 'Realtime Auctions',
      description:
        'Concurrency-safe bidding, proxy bids, anti-sniping, and reserve logic. Live updates via WebSockets.',
      icon: 'gavel',
    },
    {
      id: 'ops-workflows',
      title: 'Ops-First Workflows',
      description:
        'Review queues, inspection scheduling, dispute resolution. Full auditability and RBAC.',
      icon: 'shield',
    },
    {
      id: 'buyer-subscriptions',
      title: 'Buyer Subscriptions',
      description:
        'Reuse-first approach with Supabase, Stripe, and provider-agnostic AI. Ship quickly and optimize later.',
      icon: 'zap',
    },
  ],
  howItWorks: [
    {
      id: 'step-1',
      stepNumber: 1,
      title: 'Create Listing',
      description:
        'Enter identifier, add photos, AI QA validates. Submit for ops review.',
      icon: 'upload',
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: 'Auction',
      description:
        'Verified buyers bid in real-time. Proxy bids, anti-sniping, and reserve enforcement.',
      icon: 'gavel',
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'Settle & Ship',
      description:
        'Payment via Stripe, inspection scheduling, dispute resolution. Full audit trail.',
      icon: 'package',
    },
  ],
  pricingTeaser: [
    {
      id: 'starter',
      name: 'Starter',
      description: 'For small teams getting started',
      price: 'From $99/mo',
      cta: 'View Pricing',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For growing businesses',
      price: 'From $299/mo',
      cta: 'View Pricing',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for large orgs',
      price: 'Contact us',
      cta: 'View Pricing',
    },
  ],
  trustLogos: ['Security', 'Compliance', 'SOC2', 'GDPR'],
  footerSections: [
    {
      title: 'Product',
      links: [
        { label: 'Marketplace', href: '/marketplace' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Pricing', href: '/billing' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Help & Support', href: '/help' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
      ],
    },
  ],
}
