/**
 * LiveCTAGroup - Join Live Bidding button, Proxy Bid setup button, contextual hints.
 */
import { Link } from 'react-router-dom'
import { Gavel, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface LiveCTAGroupProps {
  listingId: string
  isLive?: boolean
  isEnded?: boolean
  isAuthenticated?: boolean
  isSubscribed?: boolean
  className?: string
}

export function LiveCTAGroup({
  listingId,
  isLive = false,
  isEnded = false,
  isAuthenticated = false,
  isSubscribed = false,
  className,
}: LiveCTAGroupProps) {
  const livePath = `/listing/${listingId}/live`

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
      {!isAuthenticated ? (
        <Button asChild size="lg" className="w-full sm:w-auto hover:shadow-accent-glow">
          <Link to="/auth?mode=login">Sign in to bid</Link>
        </Button>
      ) : !isSubscribed ? (
        <Button asChild size="lg" className="w-full sm:w-auto hover:shadow-accent-glow">
          <Link to="/dashboard/buyer">Subscribe to bid</Link>
        </Button>
      ) : !isLive && !isEnded ? (
        <p className="text-sm text-muted-foreground">
          Bidding opens when the auction goes live.
        </p>
      ) : isEnded ? (
        <p className="text-sm text-muted-foreground">
          This auction has ended.
        </p>
      ) : (
        <>
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto hover:shadow-accent-glow animate-pulse"
          >
            <Link to={livePath}>
              <Zap className="mr-2 h-4 w-4" />
              Join Live Bidding
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link to={livePath}>
              <Gavel className="mr-2 h-4 w-4" />
              Set Proxy Bid
            </Link>
          </Button>
        </>
      )}
    </div>
  )
}
