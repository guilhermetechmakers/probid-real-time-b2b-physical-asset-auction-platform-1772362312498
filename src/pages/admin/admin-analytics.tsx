/**
 * Admin Analytics / Reports - Dashboard for conversion, demand, auction health,
 * estimate accuracy. KPI cards, time-series charts, distribution bars, export.
 */
import { useEffect, useState, useCallback, useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import {
  KPICard,
  TimeSeriesChart,
  DistributionBar,
  FilterBar,
  ExportPanel,
  ReportsTable,
} from '@/components/analytics'
import type { FilterBarFilters } from '@/components/analytics'
import { fetchAnalyticsMetrics, fetchAnalyticsEvents } from '@/api/analytics'
import type { AnalyticsMetricsResponse, AnalyticsEvent } from '@/types/analytics'
import type { TrendDirection } from '@/components/analytics/kpi-card'

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function defaultRange(): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return { startDate: toIsoDate(start), endDate: toIsoDate(end) }
}

export function AdminAnalyticsPage() {
  const { startDate, endDate } = defaultRange()
  const [filters, setFilters] = useState<FilterBarFilters>({
    startDate,
    endDate,
    category: 'All',
    buyerSegment: 'All',
  })
  const [metricsData, setMetricsData] = useState<AnalyticsMetricsResponse | null>(null)
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [metricsRes, eventsRes] = await Promise.all([
        fetchAnalyticsMetrics({
          startDate: filters.startDate,
          endDate: filters.endDate,
          category: filters.category !== 'All' ? filters.category : undefined,
          buyerSegment: filters.buyerSegment !== 'All' ? filters.buyerSegment : undefined,
        }),
        fetchAnalyticsEvents({
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
      ])
      setMetricsData(metricsRes)
      setEvents(eventsRes ?? [])
    } catch {
      setMetricsData(null)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [filters.startDate, filters.endDate, filters.category, filters.buyerSegment])

  useEffect(() => {
    loadData()
  }, [loadData])

  const metrics = metricsData?.metrics ?? {
    conversion: 0,
    demand: 0,
    auctionHealth: 0,
    estimateAccuracy: 0,
    revenue: 0,
    totalListings: 0,
    completedSales: 0,
    activeBuyers: 0,
    totalBids: 0,
  }
  const series = metricsData?.series ?? []
  const breakdown = metricsData?.breakdown ?? []

  const distributionData = useMemo(() => {
    return (
      Array.isArray(breakdown)
        ? breakdown.map((b) => ({ category: b.key, value: b.value }))
        : []
    )
  }, [breakdown])

  const hasData =
    (metrics.revenue ?? 0) > 0 ||
    (metrics.totalBids ?? 0) > 0 ||
    series.length > 0 ||
    distributionData.length > 0

  const getTrend = (val: number): TrendDirection => {
    if (val > 0) return 'up'
    if (val < 0) return 'down'
    return 'flat'
  }

  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
          <BarChart3 className="h-8 w-8 text-probid-accent" />
          Analytics / Reports
        </h1>
        <p className="mt-1 text-muted-foreground">
          Conversion, demand, auction health, estimate accuracy — export and schedule reports
        </p>
      </div>

      <FilterBar onApply={setFilters} initialFilters={filters} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Conversion"
          value={metrics.conversion}
          unit="%"
          delta={metrics.conversion > 0 ? 5 : undefined}
          trend={getTrend(metrics.conversion > 0 ? 5 : 0)}
        />
        <KPICard
          label="Demand"
          value={metrics.demand}
          unit="%"
          delta={metrics.demand > 0 ? 3 : undefined}
          trend={getTrend(metrics.demand > 0 ? 3 : 0)}
        />
        <KPICard
          label="Auction Health"
          value={metrics.auctionHealth}
          unit="%"
          delta={metrics.auctionHealth > 0 ? 2 : undefined}
          trend="up"
        />
        <KPICard
          label="Estimate Accuracy"
          value={metrics.estimateAccuracy}
          unit="%"
          delta={metrics.estimateAccuracy > 0 ? 1 : undefined}
          trend="up"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard
          label="Revenue"
          value={metrics.revenue ?? 0}
          unit="$"
          className="lg:col-span-1"
        />
        <KPICard
          label="Total Bids"
          value={metrics.totalBids ?? 0}
          className="lg:col-span-1"
        />
        <KPICard
          label="Active Buyers"
          value={metrics.activeBuyers ?? 0}
          className="lg:col-span-1"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-[rgb(var(--muted))]/30" />
          ) : (
            <TimeSeriesChart
              data={series}
              title="Performance Over Time"
              series={['revenue', 'bids', 'buyers']}
            />
          )}
        </div>
        <div>
          {isLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-[rgb(var(--muted))]/30" />
          ) : (
            <DistributionBar
              data={distributionData}
              title="Demand by Category"
            />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReportsTable
            events={events}
            startDate={filters.startDate ?? ''}
            endDate={filters.endDate ?? ''}
          />
        </div>
        <div>
          <ExportPanel filters={filters} hasData={hasData} />
        </div>
      </div>
    </div>
  )
}
