/**
 * DataVizPanel - Lightweight charts for user stats.
 */
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DataVizPanelProps {
  kycByStatus: Record<string, number>
  subscriptionByStatus: Record<string, number>
  bannedCount: number
  totalCount: number
  className?: string
}

const NEON_FILL = '#EFFD2D'

export function DataVizPanel({
  kycByStatus,
  subscriptionByStatus,
  bannedCount,
  totalCount,
  className,
}: DataVizPanelProps) {
  const kycData = Object.entries(kycByStatus).map(([name, value]) => ({ name, value }))
  const subData = Object.entries(subscriptionByStatus).map(([name, value]) => ({ name, value }))

  const bannedPct = totalCount > 0 ? Math.round((bannedCount / totalCount) * 100) : 0

  return (
    <div className={cn('grid gap-4 md:grid-cols-2', className)}>
      <Card className="rounded-xl border-[rgb(var(--border))] shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kycData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill={NEON_FILL} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-[rgb(var(--border))] shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill={NEON_FILL} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-[rgb(var(--border))] shadow-card md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[rgb(var(--border))]">
              <div
                className="h-full rounded-full bg-destructive transition-all duration-300"
                style={{ width: `${bannedPct}%` }}
              />
            </div>
            <span className="text-sm font-medium">
              {bannedCount} / {totalCount} ({bannedPct}%)
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
