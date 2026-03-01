/**
 * DataVizBar - Minimalist horizontal bar for quick stats (active/inactive segments).
 */

import { cn } from '@/lib/utils'

const ACCENT_COLOR = '#EFFD2D'
const MUTED_COLOR = 'rgb(126, 126, 126)'

interface DataVizBarProps {
  value: number
  max: number
  label?: string
  showActive?: boolean
  className?: string
}

export function DataVizBar({ value, max, label, showActive = true, className }: DataVizBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={cn('space-y-1', className)}>
      {label != null && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{value} / {max}</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[rgb(var(--secondary))]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: showActive ? ACCENT_COLOR : MUTED_COLOR,
          }}
        />
      </div>
    </div>
  )
}
