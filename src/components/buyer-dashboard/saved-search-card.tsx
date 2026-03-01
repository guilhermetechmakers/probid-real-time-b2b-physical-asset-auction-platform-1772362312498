/**
 * SavedSearchCard - Saved filter presets with load/apply and edit/delete actions.
 */

import { Filter, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SavedFilter } from '@/types'

interface SavedSearchCardProps {
  filter: SavedFilter
  onApply: (filter: SavedFilter) => void
  onDelete: (id: string) => void
  isApplying?: boolean
  className?: string
}

export function SavedSearchCard({
  filter,
  onApply,
  onDelete,
  isApplying = false,
  className,
}: SavedSearchCardProps) {
  const filterLabels: string[] = []
  if (filter.filters?.category) filterLabels.push(filter.filters.category)
  if (filter.filters?.location) filterLabels.push(filter.filters.location)
  if (filter.filters?.condition) filterLabels.push(filter.filters.condition)
  if (filter.filters?.priceMin != null || filter.filters?.priceMax != null) {
    const min = filter.filters.priceMin ?? 0
    const max = filter.filters.priceMax ?? '∞'
    filterLabels.push(`$${min}-${max}`)
  }

  return (
    <Card
      className={cn(
        'rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 transition-all hover:border-primary/20',
        className
      )}
    >
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-medium truncate">{filter.name}</span>
          </div>
          {filterLabels.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {filterLabels.join(' • ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onApply(filter)}
            disabled={isApplying}
            className="hover:border-primary"
          >
            {isApplying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Apply'
            )}
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onDelete(filter.id)}
            aria-label="Delete filter"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
