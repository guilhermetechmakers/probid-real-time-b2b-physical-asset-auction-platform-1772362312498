/**
 * TimeSeriesChart - Renders revenue, bids, buyers over time.
 * Recharts line/area with neon yellow-green active fills, tooltips.
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { TimeSeriesDataPoint } from '@/types/analytics'

const NEON_FILL = '#EFFD2D'
const GRAY_FILL = 'rgb(var(--muted))'

export interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[]
  title?: string
  series?: Array<'revenue' | 'bids' | 'buyers'>
  className?: string
}

export function TimeSeriesChart({
  data,
  title = 'Performance Over Time',
  series = ['revenue', 'bids', 'buyers'],
  className,
}: TimeSeriesChartProps) {
  const safeData = Array.isArray(data) ? data : []
  const hasData = safeData.length > 0

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return d
    }
  }

  return (
    <Card
      className={cn(
        'rounded-xl border border-[rgb(var(--border))] shadow-card',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64" role="img" aria-label={`Chart: ${title}`}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={safeData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRAY_FILL} opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 10 }}
                  stroke="rgb(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="rgb(var(--muted-foreground))"
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--card))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelFormatter={formatDate}
                  formatter={(value: number) => [value?.toLocaleString() ?? '0', '']}
                />
                <Legend />
                {series.includes('revenue') && (
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={NEON_FILL}
                    strokeWidth={2}
                    dot={{ fill: NEON_FILL, r: 3 }}
                    connectNulls
                  />
                )}
                {series.includes('bids') && (
                  <Line
                    type="monotone"
                    dataKey="bids"
                    name="Bids"
                    stroke="#46d573"
                    strokeWidth={2}
                    dot={{ fill: '#46d573', r: 3 }}
                    connectNulls
                  />
                )}
                {series.includes('buyers') && (
                  <Line
                    type="monotone"
                    dataKey="buyers"
                    name="Active Buyers"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={{ fill: '#60a5fa', r: 3 }}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="flex h-full items-center justify-center rounded-lg bg-[rgb(var(--muted))]/30 text-sm text-muted-foreground"
              role="status"
            >
              No data for this period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
