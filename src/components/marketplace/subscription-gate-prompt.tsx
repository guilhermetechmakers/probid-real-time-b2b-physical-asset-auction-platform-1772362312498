/**
 * SubscriptionGatePrompt - Shown when user tries to join/watch without subscription.
 * Prompts to subscribe or upgrade.
 */

import { Link } from 'react-router-dom'
import { CreditCard, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SubscriptionGatePromptProps {
  variant?: 'inline' | 'card'
  className?: string
}

export function SubscriptionGatePrompt({
  variant = 'inline',
  className,
}: SubscriptionGatePromptProps) {
  const content = (
    <>
      <Lock className="h-4 w-4 shrink-0 text-primary" />
      <span className="text-sm">
        Subscribe to join bids and add items to your watchlist
      </span>
      <Button asChild size="sm" className="ml-2 shrink-0">
        <Link to="/pricing">
          <CreditCard className="mr-1.5 h-4 w-4" />
          View Plans
        </Link>
      </Button>
    </>
  )

  if (variant === 'card') {
    return (
      <Card
        className={cn(
          'border-primary/30 bg-probid-soft-yellow/10',
          className
        )}
      >
        <CardContent className="flex flex-wrap items-center gap-3 py-4">
          {content}
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3',
        className
      )}
    >
      {content}
    </div>
  )
}
