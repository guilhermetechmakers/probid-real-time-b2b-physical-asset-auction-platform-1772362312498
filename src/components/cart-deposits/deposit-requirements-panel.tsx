/**
 * DepositRequirementsPanel - Per-auction deposit requirements.
 * Shows required amount, expiry rules, release conditions, and active hold status.
 */
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Gavel, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DepositRequirements } from '@/types/deposits'

export interface DepositRequirementsPanelProps {
  requirements: DepositRequirements[]
  onCreateHold?: (auctionId: string, amount: number, currency: string) => void
  isCreating?: boolean
  creatingAuctionId?: string | null
  className?: string
}

export function DepositRequirementsPanel({
  requirements,
  onCreateHold,
  isCreating = false,
  creatingAuctionId,
  className,
}: DepositRequirementsPanelProps) {
  const list = Array.isArray(requirements) ? requirements : []

  if (list.length === 0) {
    return (
      <Card
        className={cn(
          'rounded-2xl border border-[rgb(var(--border))] bg-card shadow-card',
          className
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold uppercase tracking-wide">
            <Gavel className="h-4 w-4 text-muted-foreground" />
            Deposit requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No auction deposit requirements. Bid on an auction or add items to your watchlist to see requirements here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-card shadow-card',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold uppercase tracking-wide">
          <Gavel className="h-4 w-4 text-muted-foreground" />
          Deposit requirements
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add a hold to participate in these auctions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {(list ?? []).map((req) => {
          const hasHold = req?.hasActiveHold ?? false
          const amount = req?.requiredAmount ?? 0
          const currency = req?.currency ?? 'USD'
          const isCreatingThis = creatingAuctionId === req?.auctionId

          return (
            <div
              key={req?.auctionId ?? ''}
              className="flex flex-col gap-3 rounded-xl border border-[rgb(var(--border))] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{req?.auctionTitle ?? 'Auction'}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(amount, currency)} required
                  </p>
                </div>
                {hasHold ? (
                  <Badge variant="success" className="gap-1">
                    <Check className="h-3 w-3" />
                    Hold active
                  </Badge>
                ) : (
                  onCreateHold != null && (
                    <Button
                      size="sm"
                      onClick={() => onCreateHold(req.auctionId, amount, currency)}
                      disabled={isCreating || isCreatingThis}
                      className="uppercase bg-probid-charcoal text-probid-accent hover:bg-probid-charcoal/90"
                    >
                      {isCreatingThis ? (
                        'Adding…'
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add hold
                        </>
                      )}
                    </Button>
                  )
                )}
              </div>
              {req?.listingId && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/listing/${req.listingId}`}>View listing</Link>
                </Button>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
