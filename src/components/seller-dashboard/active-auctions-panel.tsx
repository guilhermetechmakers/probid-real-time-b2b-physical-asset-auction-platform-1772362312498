import { Link } from 'react-router-dom'
import { Gavel, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useSellerAuctions } from '@/hooks/use-seller-dashboard'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export function ActiveAuctionsPanel() {
  const { data: auctions, isLoading, error } = useSellerAuctions()

  const list = Array.isArray(auctions) ? auctions : []

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Failed to load auctions.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Gavel className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No upcoming auctions</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Listings will appear here when scheduled for auction
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Upcoming Auctions</h2>
      <div className="space-y-4">
        {list.map((auction) => {
          const start = new Date(auction.startTime).getTime()
          const end = new Date(auction.endTime).getTime()
          const now = Date.now()
          const total = end - start
          const elapsed = now - start
          const progress = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0

          return (
            <Card
              key={auction.id}
              className="transition-all duration-300 hover:shadow-card-hover"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div>
                  <h3 className="font-semibold">
                    {auction.listing?.title ?? 'Listing'}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDateTime(auction.startTime)} – {formatDateTime(auction.endTime)}
                  </div>
                </div>
                <Badge status={auction.status} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-6 text-sm">
                  {auction.reservePrice != null && (
                    <span>
                      Reserve: <strong>{formatCurrency(auction.reservePrice)}</strong>
                    </span>
                  )}
                  {auction.currentBid != null && (
                    <span className="text-probid-accent">
                      High bid: <strong>{formatCurrency(auction.currentBid)}</strong>
                    </span>
                  )}
                </div>
                {auction.status === 'live' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Time to close</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/listing/${auction.listingId}`}>View listing</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function Badge({ status }: { status: string }) {
  const variant =
    status === 'live'
      ? 'bg-probid-accent/20 text-probid-charcoal'
      : 'bg-secondary text-muted-foreground'
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${variant}`}
    >
      {status === 'live' ? 'Live' : 'Scheduled'}
    </span>
  )
}
