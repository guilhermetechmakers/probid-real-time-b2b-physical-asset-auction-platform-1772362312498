import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'

const ACCENT_COLOR = '#EFFD2D'
const MUTED_COLOR = 'rgb(126, 126, 126)'

interface DataVizBarItem {
  name: string
  value: number
  fill?: string
}

interface HorizontalBarChartProps {
  data: DataVizBarItem[]
  height?: number
  className?: string
}

export function HorizontalBarChart({ data, height = 200, className }: HorizontalBarChartProps) {
  const safeData = Array.isArray(data) ? data : []
  const maxVal = Math.max(...safeData.map((d) => d.value), 1)

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={safeData}
          layout="vertical"
          margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
        >
          <XAxis type="number" hide domain={[0, maxVal * 1.1]} />
          <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid rgb(229, 229, 234)',
            }}
            formatter={(value: number) => [value, '']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {(safeData ?? []).map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill ?? (index === 0 ? ACCENT_COLOR : MUTED_COLOR)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface KpiNumberProps {
  value: number | string
  label: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function KpiNumber({ value, label, trend, className }: KpiNumberProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      {trend && (
        <span
          className={cn(
            'text-xs font-medium mt-0.5',
            trend === 'up' && 'text-success',
            trend === 'down' && 'text-destructive',
            trend === 'neutral' && 'text-muted-foreground'
          )}
          aria-hidden
        >
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
        </span>
      )}
    </div>
  )
}

interface HorizontalBarProps {
  value: number
  max: number
  label?: string
  className?: string
}

export function HorizontalBar({ value, max, label, className }: HorizontalBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{value} / {max}</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[rgb(var(--secondary))]">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down'
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({ label, value, subtext, trend, icon, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
        </div>
        {icon && (
          <div className="rounded-lg bg-primary/20 p-2 text-primary">{icon}</div>
        )}
      </div>
      {trend && (
        <span
          className={cn(
            'mt-2 inline-block text-xs font-medium',
            trend === 'up' ? 'text-success' : 'text-destructive'
          )}
        >
          {trend === 'up' ? '↑' : '↓'} vs last period
        </span>
      )}
    </div>
  )
}
