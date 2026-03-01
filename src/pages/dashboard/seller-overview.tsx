import { Link } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  MetricsPanel,
  ListingsPanel,
  CreateListingCTA,
  ActivityFeedPanel,
  NotificationsPanel,
} from '@/components/seller-dashboard'

export function SellerOverviewPage() {
  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your listings and track auction activity
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/seller/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Listing
          </Link>
        </Button>
      </div>

      <MetricsPanel />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CreateListingCTA />
          <ListingsPanel />
        </div>
        <div className="space-y-6">
          <ActivityFeedPanel />
          <NotificationsPanel />
        </div>
      </div>
    </div>
  )
}
