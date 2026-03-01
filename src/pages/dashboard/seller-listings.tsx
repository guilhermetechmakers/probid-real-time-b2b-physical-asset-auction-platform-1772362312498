import { ListingsPanel } from '@/components/seller-dashboard'

export function SellerListingsPage() {
  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold">Listings</h1>
        <p className="text-muted-foreground">
          Manage your active listings and drafts
        </p>
      </div>
      <ListingsPanel />
    </div>
  )
}
