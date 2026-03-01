/**
 * DistributionBar - Horizontal bars for estimate accuracy by category, demand by category.
 * Neon yellow-green fill for active/within-target; light gray for others.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DistributionBarItem } from '@/types/analytics'

const NEON_FILL = '#EFFD2D'
const GRAY_FILL = 'rgb(var(--border))'

export interface DistributionBarProps {
  data: DistributionBarItem[]
  title?: string
  maxValue?: number
  className?: string
}

export function DistributionBar({
  data,
  title = 'Distribution',
  maxValue,
  className,
}: DistributionBarProps) {
  const safeData = Array.isArray(data) ? data : []
  const computedMax = maxValue ?? Math.max(...safeData.map((d) => d.value), 1)

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
        {safeData.length > 0 ? (
          <div className="space-y-3" role="list">
            {safeData.map((item, i) => {
              const pct = computedMax > 0 ? (item.value / computedMax) * 100 : 0
              return (
                <div key={`${item.category}-${i}`} className="space-y-1" role="listitem">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate max-w-[60%]">{item.category}</span>
                    <span className="text-muted-foreground tabular-nums">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--border))]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: pct > 0 ? NEON_FILL : GRAY_FILL,
                      }}
                      role="progressbar"
                      aria-valuenow={item.value}
                      aria-valuemin={0}
                      aria-valuemax={computedMax}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div
            className="flex h-24 items-center justify-center rounded-lg bg-[rgb(var(--muted))]/30 text-sm text-muted-foreground"
            role="status"
          >
            No data for this period
          </div>
        )}
      </CardContent>
    </Card>
  )
}
