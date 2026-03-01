/**
 * Admin Auction Monitor - Live auctions with pause/extend/cancel controls.
 */
import { AuctionMonitor } from '@/components/admin'

export function AdminAuctionsPage() {
  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Auction Monitor</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor and intervene in live auctions
        </p>
      </div>
      <AuctionMonitor />
    </div>
  )
}
