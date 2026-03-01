/**
 * AuctionHeader - Displays asset title, current price, timer, status, reserve info.
 */
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusPill, type AuctionStatusPill } from '@/components/ui/status-pill'
import { AuctionTimer } from './auction-timer'
import { cn, formatCurrency } from '@/lib/utils'

export interface AuctionHeaderProps {
  listingId: string
  title: string
  identifier?: string
  currentBid: number
  reservePrice?: number
  reserveMet?: boolean
  status: AuctionStatusPill
  endTime?: string
  remainingSeconds?: number
  bidCount?: number
  className?: string
}

export function AuctionHeader({
  listingId,
  title,
  identifier,
  currentBid,
  reservePrice = 0,
  reserveMet = false,
  status,
  endTime,
  remainingSeconds,
  bidCount = 0,
  className,
}: AuctionHeaderProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-[rgb(var(--border))] bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover',
        status === 'live' && 'border-primary/50 shadow-accent-glow',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/listing/${listingId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to listing
          </Link>
        </Button>
        <StatusPill status={status} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
          {(identifier ?? '') && (
            <p className="mt-1 text-sm text-muted-foreground">
              Live Auction • {identifier}
            </p>
          )}
        </div>

        <div className="flex flex-col justify-center rounded-xl border-2 border-primary/50 bg-primary/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Current bid
          </p>
          <p className="mt-1 text-2xl font-bold text-primary md:text-3xl">
            {formatCurrency(currentBid)}
          </p>
          {bidCount > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {bidCount} bid{bidCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
          <AuctionTimer
            endTime={endTime}
            remainingSeconds={remainingSeconds}
            status={
              status === 'ended'
                ? 'ended'
                : status === 'live' || status === 'extending'
                  ? 'live'
                  : 'scheduled'
            }
          />
          {reservePrice > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 px-4 py-2">
              <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Reserve</p>
                <p
                  className={cn(
                    'text-sm font-medium',
                    reserveMet ? 'text-success' : 'text-muted-foreground'
                  )}
                >
                  {reserveMet ? 'Met' : formatCurrency(reservePrice)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
