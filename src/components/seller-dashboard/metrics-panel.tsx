import { Package, FileEdit, Gavel, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSellerMetrics } from '@/hooks/use-seller-dashboard'
import { formatCurrency } from '@/lib/utils'

const METRIC_CONFIG = [
  {
    key: 'listingCount',
    label: 'Active Listings',
    icon: Package,
    subtext: 'Ready for auction',
  },
  {
    key: 'draftCount',
    label: 'Drafts',
    icon: FileEdit,
    subtext: 'In progress',
  },
  {
    key: 'liveAuctionCount',
    label: 'Live Auctions',
    icon: Gavel,
    subtext: 'Currently running',
  },
  {
    key: 'totalSold',
    label: 'Total Sold',
    icon: TrendingUp,
    subtext: 'All time',
  },
]

export function MetricsPanel() {
  const { data: metrics, isLoading, error } = useSellerMetrics()

  if (error) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">Error loading metrics</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-1 h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const m = metrics ?? {
    listingCount: 0,
    draftCount: 0,
    liveAuctionCount: 0,
    totalSold: 0,
    sellThroughRate: 0,
    avgSalePrice: 0,
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {METRIC_CONFIG.map(({ key, label, icon: Icon, subtext }) => {
        const value = m[key as keyof typeof m] as number
        return (
          <Card
            key={key}
            className="transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{subtext}</p>
            </CardContent>
          </Card>
        )
      })}
      <Card className="sm:col-span-2 lg:col-span-1 transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-sm font-medium text-muted-foreground">Sell-through Rate</span>
          <TrendingUp className="h-4 w-4 text-probid-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-probid-accent">
            {(m.sellThroughRate ?? 0).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">Conversion rate</p>
        </CardContent>
      </Card>
      <Card className="sm:col-span-2 lg:col-span-1 transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-sm font-medium text-muted-foreground">Avg Sale Price</span>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(m.avgSalePrice ?? 0)}</div>
          <p className="text-xs text-muted-foreground">Per item</p>
        </CardContent>
      </Card>
    </div>
  )
}
