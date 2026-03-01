import { Link } from 'react-router-dom'
import { Camera, Gavel, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(239,253,45,0.15)_0%,_transparent_50%)]" />
        <div className="container relative px-4 py-24 md:px-6 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Real-Time B2B Auctions for{' '}
              <span className="bg-gradient-to-r from-primary to-probid-soft-yellow bg-clip-text text-transparent">
                Physical Assets
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Intelligent intake, AI-powered QA, and a correctness-first auction
              engine. Enterprise-grade platform for sellers and buyers.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/marketplace">Browse Marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid - Bento style */}
      <section className="container px-4 py-20 md:px-6">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
          Why ProBid
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2 transition-all duration-300 hover:shadow-accent-glow">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary">
                  <Camera className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Intelligent Intake + AI Vision QA
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Identifier-driven enrichment and pluggable AI vision pipeline
                    for photo validation. Structured QA outputs with hard fails,
                    warnings, and evidence for ops review.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:shadow-accent-glow">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary">
                  <Gavel className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Realtime Auctions</h3>
                  <p className="mt-2 text-muted-foreground">
                    Concurrency-safe bidding, proxy bids, anti-sniping, and
                    reserve logic. Live updates via WebSockets.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:shadow-accent-glow">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Ops-First Workflows</h3>
                  <p className="mt-2 text-muted-foreground">
                    Review queues, inspection scheduling, dispute resolution.
                    Full auditability and RBAC.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2 transition-all duration-300 hover:shadow-accent-glow">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Fast Time-to-First-Listing
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Reuse-first approach with Supabase, Stripe, and provider-agnostic
                    AI. Ship quickly and optimize later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/30 py-20">
        <div className="container px-4 md:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="font-semibold">Create Listing</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter identifier, add photos, AI QA validates. Submit for ops
                review.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="font-semibold">Auction</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Verified buyers bid in real-time. Proxy bids, anti-sniping, and
                reserve enforcement.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="font-semibold">Settle & Ship</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Payment via Stripe, inspection scheduling, dispute resolution.
                Full audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-20 md:px-6">
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-r from-primary/20 to-probid-soft-yellow/20 p-12 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Ready to list or bid?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join ProBid and start trading physical assets with confidence.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
