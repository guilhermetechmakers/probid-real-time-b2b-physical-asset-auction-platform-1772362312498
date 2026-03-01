/**
 * FilterPanel - Collapsible facets: category, condition, price range, auction date.
 */

import { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { ListingFilters } from '@/types/marketplace'
import { cn } from '@/lib/utils'

const CATEGORY_OPTIONS = [
  'Industrial Equipment',
  'Machinery',
  'Vehicles',
  'Electronics',
  'Office Furniture',
  'Other',
]

const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair', 'As-Is']

interface FilterPanelProps {
  filters: ListingFilters
  onChange: (filters: ListingFilters) => void
  className?: string
}

export function FilterPanel({ filters, onChange, className }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const update = (updates: Partial<ListingFilters>) => {
    onChange({ ...filters, ...updates })
  }

  const clearAll = () => {
    onChange({})
  }

  const hasActiveFilters =
    (filters.category ?? '') !== '' ||
    (filters.condition ?? '') !== '' ||
    (filters.priceMin ?? 0) > 0 ||
    (filters.priceMax ?? 0) > 0 ||
    (filters.location ?? '').trim() !== ''

  return (
    <Card
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all duration-300',
        className
      )}
    >
      <CardHeader className="cursor-pointer py-4" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            )}
          </span>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  clearAll()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4 border-t border-[rgb(var(--border))] pt-4">
          <div>
            <Label htmlFor="filter-category">Category</Label>
            <select
              id="filter-category"
              className="mt-1 flex h-11 w-full rounded-xl border-0 bg-[rgb(var(--secondary))] px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={filters.category ?? ''}
              onChange={(e) => update({ category: e.target.value || undefined })}
            >
              <option value="">All</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt.toLowerCase().replace(/\s/g, '-')}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="filter-condition">Condition</Label>
            <select
              id="filter-condition"
              className="mt-1 flex h-11 w-full rounded-xl border-0 bg-[rgb(var(--secondary))] px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={filters.condition ?? ''}
              onChange={(e) => update({ condition: e.target.value || undefined })}
            >
              <option value="">All</option>
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt} value={opt.toLowerCase().replace(/\s/g, '-')}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="filter-location">Location</Label>
            <Input
              id="filter-location"
              placeholder="e.g. California"
              value={filters.location ?? ''}
              onChange={(e) => update({ location: e.target.value || undefined })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filter-price-min">Min Price ($)</Label>
              <Input
                id="filter-price-min"
                type="number"
                min={0}
                placeholder="0"
                value={filters.priceMin ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  const num = v === '' ? undefined : Number(v)
                  update({ priceMin: num != null && !Number.isNaN(num) ? num : undefined })
                }}
              />
            </div>
            <div>
              <Label htmlFor="filter-price-max">Max Price ($)</Label>
              <Input
                id="filter-price-max"
                type="number"
                min={0}
                placeholder="Any"
                value={filters.priceMax ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  const num = v === '' ? undefined : Number(v)
                  update({ priceMax: num != null && !Number.isNaN(num) ? num : undefined })
                }}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
