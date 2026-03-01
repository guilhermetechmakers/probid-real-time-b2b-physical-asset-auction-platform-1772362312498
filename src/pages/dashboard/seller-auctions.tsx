import { ActiveAuctionsPanel } from '@/components/seller-dashboard'

export function SellerAuctionsPage() {
  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold">Auctions</h1>
        <p className="text-muted-foreground">
          View and manage your upcoming auctions
        </p>
      </div>
      <ActiveAuctionsPanel />
    </div>
  )
}
