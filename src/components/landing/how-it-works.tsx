import { Gavel, Package, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Step } from '@/content/landing-content'

const iconMap = {
  upload: Upload,
  gavel: Gavel,
  package: Package,
} as const

export interface HowItWorksProps {
  steps: Step[]
}

export function HowItWorks({ steps }: HowItWorksProps) {
  const items = Array.isArray(steps) ? steps : []

  if (items.length === 0) {
    return (
      <section className="bg-[#F5F6FA]/50 py-20" aria-label="How it works">
        <p className="container px-5 text-center text-[#7E7E7E] md:px-6">
          No steps to display.
        </p>
      </section>
    )
  }

  return (
    <section
      className="bg-[#F5F6FA]/50 py-20"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container px-5 md:px-6">
        <h2
          id="how-it-works-heading"
          className="mb-12 text-center text-3xl font-bold text-[#181818] md:text-4xl"
        >
          How It Works
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((step, index) => {
            const IconComponent =
              iconMap[step.icon as keyof typeof iconMap] ?? Upload
            return (
              <div
                key={step.id ?? index}
                className={cn(
                  'flex flex-col items-center text-center',
                  'rounded-2xl border border-[#E5E5EA] bg-[#FFFFFF] p-8',
                  'shadow-[0_2px_8px_rgba(22,22,22,0.07)]',
                  'transition-all duration-300 hover:shadow-[0_4px_16px_rgba(22,22,22,0.12)]'
                )}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EFFD2D] text-[#161616]">
                  <IconComponent className="h-7 w-7" aria-hidden />
                </div>
                <span className="mb-2 text-sm font-medium text-[#7E7E7E]">
                  Step {step.stepNumber}
                </span>
                <h3 className="text-lg font-semibold text-[#181818]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-[#7E7E7E]" style={{ lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
