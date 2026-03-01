/**
 * SubscriptionGate - Prompts to subscribe when user attempts gated action.
 */

import { Link } from 'react-router-dom'
import { CreditCard, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SubscriptionGateProps {
  message?: string
  className?: string
}

export function SubscriptionGate({
  message = 'Subscribe to join bids and watch listings',
  className,
}: SubscriptionGateProps) {
  return (
    <Card
      className={cn(
        'border-primary/30 bg-probid-soft-yellow/10',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-5 w-5 text-primary" />
          Subscription Required
        </CardTitle>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/pricing">
            View Plans
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
