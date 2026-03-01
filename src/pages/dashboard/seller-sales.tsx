import { RecentSalesPanel } from '@/components/seller-dashboard'

export function SellerSalesPage() {
  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold">Sales</h1>
        <p className="text-muted-foreground">
          View recent sales and performance metrics
        </p>
      </div>
      <RecentSalesPanel />
    </div>
  )
}
