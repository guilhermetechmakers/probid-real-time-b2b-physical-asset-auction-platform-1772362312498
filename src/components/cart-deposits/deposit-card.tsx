/**
 * DepositCard - Single deposit hold card with amount, status, expiry, actions.
 * Runtime safety: deposit?.amount ?? 0, etc.
 */
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatTimeRemaining } from '@/lib/utils'
import { Clock, ExternalLink, Loader2, Unlock, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DepositHold } from '@/types/deposits'

export interface DepositCardProps {
  deposit: DepositHold
  onExtend?: (depositId: string) => void
  onRelease?: (depositId: string) => void
  onCheckout?: (deposit: DepositHold) => void
  isExtending?: boolean
  isReleasing?: boolean
  className?: string
}

const statusConfig: Record<
  DepositHold['status'],
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' }
> = {
  holding: { label: 'Hold', variant: 'warning' },
  captured: { label: 'Captured', variant: 'success' },
  released: { label: 'Released', variant: 'secondary' },
  expired: { label: 'Expired', variant: 'destructive' },
}

function getSecondsRemaining(expiresAt: string | null): number {
  if (!expiresAt) return 0
  const exp = new Date(expiresAt).getTime()
  const now = Date.now()
  return Math.max(0, Math.floor((exp - now) / 1000))
}

export function DepositCard({
  deposit,
  onExtend,
  onRelease,
  onCheckout,
  isExtending = false,
  isReleasing = false,
  className,
}: DepositCardProps) {
  const amount = deposit?.amount ?? 0
  const currency = deposit?.currency ?? 'USD'
  const status = deposit?.status ?? 'holding'
  const expiresAt = deposit?.expiresAt ?? null
  const config = statusConfig[status] ?? statusConfig.holding
  const isHolding = status === 'holding'
  const secondsRemaining = getSecondsRemaining(expiresAt)
  const isExpired = isHolding && secondsRemaining <= 0

  return (
    <Card
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/30',
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {deposit?.auctionTitle ?? 'Auction'}
          </p>
          <p className="text-xl font-bold">{formatCurrency(amount, currency)}</p>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {expiresAt != null && isHolding && !isExpired && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Expires in {formatTimeRemaining(secondsRemaining)}</span>
            <span className="text-xs">({formatDate(expiresAt)})</span>
          </div>
        )}
        {isExpired && isHolding && (
          <p className="text-sm text-destructive">Hold expired</p>
        )}
        {deposit?.listingId && (
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/listing/${deposit.listingId}`} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View listing
            </Link>
          </Button>
        )}
        {isHolding && !isExpired && (
          <div className="flex flex-wrap gap-2">
            {onExtend != null && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExtend(deposit.id)}
                disabled={isExtending}
                aria-label="Extend hold"
              >
                {isExtending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Extend'
                )}
              </Button>
            )}
            {onRelease != null && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRelease(deposit.id)}
                disabled={isReleasing}
                aria-label="Release hold"
              >
                {isReleasing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Unlock className="h-4 w-4" />
                    Release
                  </>
                )}
              </Button>
            )}
            {onCheckout != null && (
              <Button
                size="sm"
                onClick={() => onCheckout(deposit)}
                className="uppercase bg-probid-charcoal text-probid-accent hover:bg-probid-charcoal/90 hover:text-probid-accent"
                aria-label="Proceed to checkout"
              >
                <CreditCard className="h-4 w-4" />
                Checkout
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
