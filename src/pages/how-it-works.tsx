import { Camera, Gavel, Shield, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function HowItWorksPage() {
  const steps = [
    {
      icon: Camera,
      title: 'Intelligent Intake',
      description:
        'Enter identifier (SN/VIN), get async enrichment. Upload 15–25 photos with angle checklist. AI Vision QA validates and returns structured JSON.',
    },
    {
      icon: Gavel,
      title: 'Realtime Auctions',
      description:
        'Concurrency-safe bidding with proxy bids, anti-sniping, and reserve enforcement. Live updates via Supabase Realtime.',
    },
    {
      icon: Shield,
      title: 'Ops Workflows',
      description:
        'Review queue, approval/rejection, inspection scheduling, dispute resolution. Full audit trail and RBAC.',
    },
    {
      icon: Zap,
      title: 'Payments & Finance',
      description:
        'Stripe integration with idempotent webhooks, deposit holds, ledger reconciliation. Export for audit.',
    },
  ]

  return (
    <div className="container space-y-16 px-4 py-16 md:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">How ProBid Works</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Enterprise-grade auction platform for physical assets
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <Card key={i} className="transition-all duration-300 hover:shadow-card-hover">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary">
                    <Icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
