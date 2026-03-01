import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BuyerKYCIntroProps {
  className?: string
}

export function BuyerKYCIntro({ className }: BuyerKYCIntroProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))] p-4 transition-all duration-200',
        className
      )}
      role="region"
      aria-label="Buyer verification information"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Buyer verification (KYC)
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Buyers need KYC verification and a subscription to place bids. After
            signup, you&apos;ll be guided through the verification steps.
          </p>
          <Link
            to="/how-it-works"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            aria-label="Learn about verification steps"
          >
            Learn more about verification
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
