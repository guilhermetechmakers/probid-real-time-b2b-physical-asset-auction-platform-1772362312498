# ProBid - Real-Time B2B Physical Asset Auction Platform

Enterprise-grade auction platform for physical assets with intelligent intake, AI Vision QA, real-time bidding, and ops-first workflows.

## Tech Stack

- **React 18** + TypeScript
- **Vite** + React Router 6
- **Tailwind CSS v3** with design system
- **Shadcn/ui** (Radix UI primitives)
- **TanStack React Query**
- **React Hook Form** + Zod
- **Supabase** (Auth, Database, Storage, Realtime)
- **Sonner** for toasts

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # UI components
│   ├── layout/     # Header, Footer, Sidebar
│   └── ui/         # Shadcn-style primitives
├── contexts/       # React contexts (Auth)
├── lib/            # Utilities, Supabase, API
├── pages/          # Route pages
├── types/          # TypeScript types
└── routes.tsx      # React Router config
```

## Key Pages

- **Landing** - Hero, feature grid, how it works, CTA
- **Login / Signup** - Auth with role selection (Seller/Buyer)
- **Forgot Password** - Password reset flow
- **Marketplace** - Listing browse with search
- **Seller Dashboard** - Listings, create wizard, metrics
- **Buyer Dashboard** - Auctions, watchlist, subscription
- **Create Listing** - Multi-step intake wizard
- **Settings** - Profile, subscription

## Design System

ProBid uses a crisp, high-contrast palette:

- **Primary accent:** Neon yellow-green (#EFFD2D)
- **Secondary accent:** Dark charcoal (#161616)
- **Background:** White / Light gray (#F5F6FA)
- **Borders:** Light gray (#E5E5EA)

Typography: Inter, 400/500/700 weights. Cards: 12–16px radius, soft shadow, hover elevation.

## License

Proprietary - ProBid
