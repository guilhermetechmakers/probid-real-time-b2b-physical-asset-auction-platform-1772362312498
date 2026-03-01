/**
 * DataVisualBar - Minimalist horizontal bar for live stats.
 * Active portions use neon yellow-green fill; inactive uses light gray.
 */
import { cn } from '@/lib/utils'

export interface DataVisualBarProps {
  value: number
  max: number
  label?: string
  showActive?: boolean
  className?: string
}

export function DataVisualBar({
  value,
  max,
  label,
  showActive = true,
  className,
}: DataVisualBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={cn('space-y-1', className)}>
      {label != null && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">
            {value} / {max}
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            showActive ? 'bg-primary' : 'bg-muted-foreground/30'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
