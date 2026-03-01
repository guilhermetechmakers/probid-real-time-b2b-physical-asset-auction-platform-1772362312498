import { TrendingUp, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HorizontalBarChart } from './data-viz'
import { useRecentSales } from '@/hooks/use-seller-dashboard'
import { formatCurrency, formatDate } from '@/lib/utils'

export function RecentSalesPanel() {
  const { data, isLoading, error } = useRecentSales()

  const sales = data?.data ?? []
  const totalSales = data?.totalSales ?? 0
  const avgSalePrice = data?.avgSalePrice ?? 0
  const sellThroughRate = data?.sellThroughRate ?? 0

  const chartData = sales
    .slice(0, 5)
    .map((s) => ({
      name: s.listingTitle ?? s.listingId.slice(0, 8),
      value: s.salePrice,
    }))

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Failed to load sales.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Recent Sales</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="transition-all duration-300 hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Sales</span>
            <TrendingUp className="h-4 w-4 text-probid-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">Items sold</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Avg Sale Price</span>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgSalePrice)}</div>
            <p className="text-xs text-muted-foreground">Per item</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Sell-through</span>
            <TrendingUp className="h-4 w-4 text-probid-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-probid-accent">
              {sellThroughRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Conversion</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={chartData} height={200} />
          </CardContent>
        </Card>
      )}

      {sales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {sales.slice(0, 5).map((sale) => (
                <li
                  key={sale.id}
                  className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3 last:border-0 last:pb-0"
                >
                  <span className="truncate">
                    {sale.listingTitle ?? sale.listingId.slice(0, 8)}
                  </span>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="font-semibold text-probid-accent">
                      {formatCurrency(sale.salePrice)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(sale.soldAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {sales.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">No sales yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Sales will appear here when your listings sell
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

