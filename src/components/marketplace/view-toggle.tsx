/**
 * ViewToggle - Switch between Grid and Map view; persists preference.
 */

import { LayoutGrid, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ViewMode = 'grid' | 'map'

interface ViewToggleProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
  showMap?: boolean
  className?: string
}

export function ViewToggle({
  value,
  onChange,
  showMap = false,
  className,
}: ViewToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/50 p-1',
        className
      )}
      role="group"
      aria-label="View mode"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('grid')}
        className={cn(
          'rounded-lg transition-all',
          value === 'grid'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-pressed={value === 'grid'}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      {showMap && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange('map')}
          className={cn(
            'rounded-lg transition-all',
            value === 'map'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={value === 'map'}
          aria-label="Map view"
        >
          <Map className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
