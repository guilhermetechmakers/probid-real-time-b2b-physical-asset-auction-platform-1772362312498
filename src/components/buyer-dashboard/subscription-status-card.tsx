import { Link } from 'react-router-dom'
import { CreditCard, Calendar, ArrowUpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { Subscription } from '@/types'
import { cn } from '@/lib/utils'

interface SubscriptionStatusCardProps {
  subscription: Subscription | null | undefined
  isLoading?: boolean
  className?: string
}

function SubscriptionStatusCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader>
        <div className="h-5 w-36 rounded bg-[rgb(var(--muted))]" />
        <div className="h-4 w-24 rounded bg-[rgb(var(--muted))]" />
      </CardHeader>
      <CardContent>
        <div className="h-12 w-full rounded-lg bg-[rgb(var(--muted))]" />
      </CardContent>
    </Card>
  )
}

function getDaysRemaining(endDate?: string): number | null {
  if (!endDate) return null
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function SubscriptionStatusCard({
  subscription,
  isLoading,
  className,
}: SubscriptionStatusCardProps) {
  const sub = subscription ?? null
  const isActive = sub?.status === 'active'
  const daysRemaining = sub?.currentPeriodEnd ? getDaysRemaining(sub.currentPeriodEnd) : null

  if (isLoading) {
    return <SubscriptionStatusCardSkeleton className={className} />
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-5 w-5 text-probid-accent" />
          Subscription
        </CardTitle>
        <Badge
          variant={isActive ? 'success' : 'secondary'}
          className={cn(isActive && 'bg-[rgb(46,213,115)] text-white')}
        >
          {isActive ? 'ACTIVE' : sub?.status ?? 'INACTIVE'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {sub ? (
          <>
            <div>
              <p className="text-lg font-bold">{sub.planName ?? `Plan ${sub.planId}`}</p>
              {sub.currentPeriodEnd && (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Renews {formatDate(sub.currentPeriodEnd)}
                  {daysRemaining != null && (
                    <span className="ml-1 font-medium">
                      ({daysRemaining} days left)
                    </span>
                  )}
                </p>
              )}
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/pricing">
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Link>
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground">
              Subscribe to access auctions and place bids
            </p>
            <Button asChild className="w-full">
              <Link to="/pricing">
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Subscribe Now
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
