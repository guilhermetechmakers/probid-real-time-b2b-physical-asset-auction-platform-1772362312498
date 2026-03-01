/**
 * FiltersPanel - Category, location, condition, price range inputs with validation.
 */

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface FilterValues {
  category?: string
  location?: string
  condition?: string
  priceMin?: number
  priceMax?: number
}

interface FiltersPanelProps {
  values: FilterValues
  onChange: (values: FilterValues) => void
  onSave?: (values: FilterValues) => void
  className?: string
}

const CATEGORY_OPTIONS = [
  'Industrial Equipment',
  'Machinery',
  'Vehicles',
  'Electronics',
  'Office Furniture',
  'Other',
]

const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair', 'As-Is']

export function FiltersPanel({
  values,
  onChange,
  onSave,
  className,
}: FiltersPanelProps) {
  const [priceMin, setPriceMin] = useState(values.priceMin?.toString() ?? '')
  const [priceMax, setPriceMax] = useState(values.priceMax?.toString() ?? '')

  const update = (updates: Partial<FilterValues>) => {
    onChange({ ...values, ...updates })
  }

  const handlePriceMinChange = (v: string) => {
    setPriceMin(v)
    const num = v === '' ? undefined : Number(v)
    if (num != null && !Number.isNaN(num)) update({ priceMin: num })
    else if (v === '') update({ priceMin: undefined })
  }

  const handlePriceMaxChange = (v: string) => {
    setPriceMax(v)
    const num = v === '' ? undefined : Number(v)
    if (num != null && !Number.isNaN(num)) update({ priceMax: num })
    else if (v === '') update({ priceMax: undefined })
  }

  const clearAll = () => {
    setPriceMin('')
    setPriceMax('')
    onChange({})
  }

  return (
    <Card className={cn('rounded-2xl border border-[rgb(var(--border))] shadow-card', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Quick Filters
          </span>
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="filter-category">Category</Label>
          <select
            id="filter-category"
            className="mt-1 flex h-11 w-full rounded-lg border-0 bg-[rgb(var(--secondary))] px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={values.category ?? ''}
            onChange={(e) => update({ category: e.target.value || undefined })}
          >
            <option value="">All</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt.toLowerCase().replace(/\s/g, '')}>
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
            value={values.location ?? ''}
            onChange={(e) => update({ location: e.target.value || undefined })}
          />
        </div>
        <div>
          <Label htmlFor="filter-condition">Condition</Label>
          <select
            id="filter-condition"
            className="mt-1 flex h-11 w-full rounded-lg border-0 bg-[rgb(var(--secondary))] px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={values.condition ?? ''}
            onChange={(e) => update({ condition: e.target.value || undefined })}
          >
            <option value="">All</option>
            {CONDITION_OPTIONS.map((opt) => (
              <option key={opt} value={opt.toLowerCase().replace(/\s/g, '')}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="filter-price-min">Min Price ($)</Label>
            <Input
              id="filter-price-min"
              type="number"
              min={0}
              placeholder="0"
              value={priceMin}
              onChange={(e) => handlePriceMinChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="filter-price-max">Max Price ($)</Label>
            <Input
              id="filter-price-max"
              type="number"
              min={0}
              placeholder="Any"
              value={priceMax}
              onChange={(e) => handlePriceMaxChange(e.target.value)}
            />
          </div>
        </div>
        {onSave != null && (
          <Button size="sm" className="w-full" onClick={() => onSave(values)}>
            Save as preset
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
