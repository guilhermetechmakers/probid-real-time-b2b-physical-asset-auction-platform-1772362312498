import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Tier } from '@/content/landing-content'

export interface PricingTeaserProps {
  tiers: Tier[]
}

export function PricingTeaser({ tiers }: PricingTeaserProps) {
  const items = Array.isArray(tiers) ? tiers : []

  if (items.length === 0) {
    return (
      <section className="container px-5 py-20 md:px-6" aria-label="Pricing">
        <p className="text-center text-[#7E7E7E]">No pricing tiers to display.</p>
      </section>
    )
  }

  return (
    <section
      className="container px-5 py-20 md:px-6"
      aria-labelledby="pricing-heading"
    >
      <h2 id="pricing-heading" className="mb-12 text-center text-3xl font-bold text-[#181818] md:text-4xl">
        Simple, Transparent Pricing
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((tier, index) => (
          <Card
            key={tier.id ?? index}
            className={cn(
              'rounded-2xl border border-[#E5E5EA] bg-[#FFFFFF] shadow-[0_2px_8px_rgba(22,22,22,0.07)]',
              'transition-all duration-300 hover:shadow-[0_4px_16px_rgba(22,22,22,0.12)] hover:shadow-[0_0_20px_rgba(239,253,45,0.1)]',
              'hover:-translate-y-1'
            )}
          >
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-[#181818]">
                {tier.name}
              </h3>
              <p className="mt-2 text-sm text-[#7E7E7E]">
                {tier.description}
              </p>
              <p className="mt-4 text-2xl font-bold text-[#181818]">
                {tier.price}
              </p>
              <Button
                asChild
                className="mt-6 w-full bg-[#EFFD2D] text-[#161616] hover:bg-[#EFFD2D]/90 hover:shadow-[0_0_20px_rgba(239,253,45,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                aria-label={`${tier.cta} for ${tier.name}`}
              >
                <Link to="/billing">{tier.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
