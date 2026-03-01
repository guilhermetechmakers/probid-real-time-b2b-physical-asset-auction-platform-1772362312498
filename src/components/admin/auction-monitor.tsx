/**
 * Auction Monitor - Live auctions with pause/extend controls.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pause, Clock, Gavel } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAdminAuctions, pauseAuction, extendAuction } from '@/api/admin'
import type { AdminAuction } from '@/types/admin'
import { toast } from 'sonner'
import { useState } from 'react'

export function AuctionMonitor() {
  const [extendId, setExtendId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-auctions'],
    queryFn: () => fetchAdminAuctions(),
    refetchInterval: 10000,
  })
  const auctions: AdminAuction[] = Array.isArray(data) ? data : []

  const pauseMutation = useMutation({
    mutationFn: pauseAuction,
    onSuccess: (res) => {
      if (res.success) toast.success('Auction paused')
      else toast.error(res.error)
      queryClient.invalidateQueries({ queryKey: ['admin-auctions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
    },
    onError: () => toast.error('Failed to pause'),
  })

  const extendMutation = useMutation({
    mutationFn: ({ id, min }: { id: string; min: number }) => extendAuction(id, min),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Auction extended')
        setExtendId(null)
      } else toast.error(res.error)
      queryClient.invalidateQueries({ queryKey: ['admin-auctions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
    },
    onError: () => toast.error('Failed to extend'),
  })

  const live = (auctions ?? []).filter((a) => a.status === 'live')
  const scheduled = (auctions ?? []).filter((a) => a.status === 'scheduled')
  const ended = (auctions ?? []).filter((a) => a.status === 'ended')

  return (
    <div className="space-y-6 animate-in-up">
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <>
          {live.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Live Auctions
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(live ?? []).map((a) => (
                  <AuctionCard
                    key={a.id}
                    auction={a}
                    onPause={() => pauseMutation.mutate(a.id)}
                    onExtend={() => setExtendId(a.id)}
                    extendLoading={extendMutation.isPending && extendId === a.id}
                    pauseLoading={pauseMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {extendId && (
            <Card className="border-primary/50">
              <CardContent className="pt-6">
                <p className="mb-3 text-sm">Extend auction by minutes:</p>
                <div className="flex gap-2">
                  {[5, 10, 15, 30].map((min) => (
                    <Button
                      key={min}
                      size="sm"
                      onClick={() => extendMutation.mutate({ id: extendId, min })}
                      disabled={extendMutation.isPending}
                    >
                      +{min} min
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setExtendId(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {scheduled.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Scheduled
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(scheduled ?? []).map((a) => (
                  <AuctionCard key={a.id} auction={a} />
                ))}
              </div>
            </div>
          )}

          {ended.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Ended
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(ended ?? []).map((a) => (
                  <AuctionCard key={a.id} auction={a} />
                ))}
              </div>
            </div>
          )}

          {(auctions ?? []).length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Gavel className="mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No auctions found</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function AuctionCard({
  auction,
  onPause,
  onExtend,
  extendLoading,
  pauseLoading,
}: {
  auction: AdminAuction
  onPause?: () => void
  onExtend?: () => void
  extendLoading?: boolean
  pauseLoading?: boolean
}) {
  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-1">{auction.listingTitle ?? 'Auction'}</CardTitle>
          <Badge
            variant={
              auction.status === 'live'
                ? 'success'
                : auction.status === 'ended'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {auction.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Current bid</span>
          <span className="font-medium">${Number(auction.currentBid ?? 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Bids</span>
          <span>{auction.bidCount ?? 0}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Ends: {new Date(auction.endTime).toLocaleString()}</span>
        </div>
        {auction.status === 'live' && (onPause ?? onExtend) && (
          <div className="flex gap-2 pt-2">
            {onPause && (
              <Button
                size="sm"
                variant="outline"
                onClick={onPause}
                disabled={pauseLoading}
              >
                <Pause className="mr-1 h-4 w-4" />
                Pause
              </Button>
            )}
            {onExtend && (
              <Button
                size="sm"
                onClick={onExtend}
                disabled={extendLoading}
              >
                <Clock className="mr-1 h-4 w-4" />
                Extend
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
