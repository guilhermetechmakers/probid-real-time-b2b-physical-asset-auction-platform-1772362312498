/**
 * KPICard - Displays a single metric with large numeric value and compact descriptor.
 * Design: bold numerals, delta indicators with color semantics (green/red).
 */
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type TrendDirection = 'up' | 'down' | 'flat'

export interface KPICardProps {
  label: string
  value: number
  delta?: number
  unit?: string
  trend?: TrendDirection
  className?: string
}

export function KPICard({
  label,
  value,
  delta,
  unit = '',
  trend = 'flat',
  className,
}: KPICardProps) {
  const displayValue = Number.isFinite(value) ? value : 0
  const displayDelta = delta != null && Number.isFinite(delta) ? delta : undefined
  const formattedValue = unit === '$' ? `$${displayValue.toLocaleString()}` : `${displayValue.toLocaleString()}${unit}`

  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-[rgb(var(--success))]', bg: 'bg-[rgb(var(--success))]/10' },
    down: { icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' },
    flat: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted' },
  }

  const config = trendConfig[trend]
  const Icon = config.icon

  return (
    <Card
      className={cn(
        'rounded-xl border border-[rgb(var(--border))] shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
      role="article"
      aria-label={`${label}: ${displayValue}${unit}`}
    >
      <CardContent className="p-4 md:p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight md:text-3xl">
            {formattedValue}
          </span>
          {displayDelta != null && (
            <span
              className={cn(
                'flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium',
                trend === 'up' && config.bg,
                trend === 'down' && config.bg,
                trend === 'flat' && config.bg,
                config.color
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {Math.abs(displayDelta)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
