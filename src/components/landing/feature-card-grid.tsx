import { Camera, Gavel, Shield, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Feature } from '@/content/landing-content'

const iconMap = {
  camera: Camera,
  gavel: Gavel,
  shield: Shield,
  zap: Zap,
} as const

export interface FeatureCardGridProps {
  features: Feature[]
}

export function FeatureCardGrid({ features }: FeatureCardGridProps) {
  const items = Array.isArray(features) ? features : []

  if (items.length === 0) {
    return (
      <section className="container px-5 py-20 md:px-6" aria-label="Features">
        <p className="text-center text-[#7E7E7E]">No features to display.</p>
      </section>
    )
  }

  return (
    <section className="container px-5 py-20 md:px-6" aria-labelledby="features-heading">
      <h2 id="features-heading" className="mb-12 text-center text-3xl font-bold text-[#181818] md:text-4xl">
        Why ProBid
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((feature, index) => {
          const IconComponent =
            iconMap[feature.icon as keyof typeof iconMap] ?? Camera
          const isWide = index === 0 || index === 3
          return (
            <Card
              key={feature.id ?? index}
              className={cn(
                'animate-fade-in-up rounded-2xl border border-[#E5E5EA] bg-[#FFFFFF] shadow-[0_2px_8px_rgba(22,22,22,0.07)]',
                'transition-all duration-300 hover:shadow-[0_4px_16px_rgba(22,22,22,0.12)] hover:shadow-[0_0_20px_rgba(239,253,45,0.15)]',
                'hover:-translate-y-1 focus-within:ring-2 focus-within:ring-[#EFFD2D] focus-within:ring-offset-2',
                isWide && 'md:col-span-2'
              )}
            >
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EFFD2D]">
                    <IconComponent className="h-6 w-6 text-[#161616]" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#181818]">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-[#7E7E7E]" style={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
