import { Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuctionList } from './auction-list'
import type { BuyerAuction } from '@/types'

interface AuctionCalendarProps {
  auctions: BuyerAuction[] | null | undefined
  isLoading?: boolean
  className?: string
}

export function AuctionCalendar({ auctions, isLoading, className }: AuctionCalendarProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-probid-accent" />
          Upcoming Auctions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Scheduled and live auctions with real-time bid activity
        </p>
      </CardHeader>
      <CardContent>
        <AuctionList auctions={auctions ?? []} isLoading={isLoading} />
      </CardContent>
    </Card>
  )
}
