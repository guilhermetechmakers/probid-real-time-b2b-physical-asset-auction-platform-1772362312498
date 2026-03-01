import type { LucideIcon } from 'lucide-react'
import { Shield, Lock, FileCheck, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const badgeIcons: Record<string, LucideIcon> = {
  Security: Shield,
  Compliance: FileCheck,
  SOC2: ShieldCheck,
  GDPR: Lock,
}

export interface TrustBadgesProps {
  logos: string[]
}

export function TrustBadges({ logos }: TrustBadgesProps) {
  const items = Array.isArray(logos) ? logos : []

  if (items.length === 0) {
    return null
  }

  return (
    <section
      className="border-y border-[#E5E5EA] bg-[#F5F6FA]/50 py-12"
      aria-label="Trust and compliance"
    >
      <div className="container px-5 md:px-6">
        <p className="mb-8 text-center text-sm font-medium text-[#7E7E7E]">
          Trusted by enterprises worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {items.map((label, index) => {
            const IconComponent = badgeIcons[label] ?? Shield
            return (
              <div
                key={label ?? index}
                className={cn(
                  'flex items-center gap-2 rounded-xl border border-[#E5E5EA] bg-[#FFFFFF] px-6 py-4',
                  'shadow-[0_2px_8px_rgba(22,22,22,0.07)]',
                  'transition-all duration-200 hover:shadow-[0_4px_12px_rgba(22,22,22,0.08)]'
                )}
              >
                <IconComponent
                  className="h-5 w-5 text-[#EFFD2D]"
                  aria-hidden
                />
                <span className="text-sm font-medium text-[#181818]">
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
