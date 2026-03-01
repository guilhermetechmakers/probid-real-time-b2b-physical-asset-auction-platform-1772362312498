/**
 * FilterBar - Date range, category, buyer segment filters.
 * On apply, triggers data fetch for analytics panels.
 */
import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface FilterBarFilters {
  startDate: string
  endDate: string
  category: string
  buyerSegment: string
}

const DEFAULT_CATEGORIES = ['All', 'Industrial', 'Vehicles', 'Equipment', 'Electronics', 'Other']
const BUYER_SEGMENTS = ['All', 'Enterprise', 'SMB', 'Individual']

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function defaultRange(): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return { startDate: toIsoDate(start), endDate: toIsoDate(end) }
}

export interface FilterBarProps {
  onApply: (filters: FilterBarFilters) => void
  initialFilters?: Partial<FilterBarFilters>
  className?: string
}

export function FilterBar({
  onApply,
  initialFilters,
  className,
}: FilterBarProps) {
  const { startDate: initStart, endDate: initEnd } = defaultRange()
  const [startDate, setStartDate] = useState(initialFilters?.startDate ?? initStart)
  const [endDate, setEndDate] = useState(initialFilters?.endDate ?? initEnd)
  const [category, setCategory] = useState(initialFilters?.category ?? 'All')
  const [buyerSegment, setBuyerSegment] = useState(initialFilters?.buyerSegment ?? 'All')

  const handleApply = useCallback(() => {
    const start = startDate ?? initStart
    const end = endDate ?? initEnd
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    const validStart = !isNaN(s) ? start : initStart
    const validEnd = !isNaN(e) ? end : initEnd
    const finalStart = s <= e ? validStart : validEnd
    const finalEnd = s <= e ? validEnd : validStart

    onApply({
      startDate: finalStart,
      endDate: finalEnd,
      category: category ?? 'All',
      buyerSegment: buyerSegment ?? 'All',
    })
  }, [startDate, endDate, category, buyerSegment, initStart, initEnd, onApply])

  const handleReset = useCallback(() => {
    const { startDate: s, endDate: e } = defaultRange()
    setStartDate(s)
    setEndDate(e)
    setCategory('All')
    setBuyerSegment('All')
    onApply({
      startDate: s,
      endDate: e,
      category: 'All',
      buyerSegment: 'All',
    })
  }, [onApply])

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-4 rounded-xl border border-[rgb(var(--border))] bg-card p-4 shadow-card',
        className
      )}
    >
      <div className="space-y-2">
        <Label htmlFor="filter-start" className="text-xs font-medium text-muted-foreground">
          Start Date
        </Label>
        <Input
          id="filter-start"
          type="date"
          value={startDate ?? ''}
          onChange={(e) => setStartDate(e.target.value ?? initStart)}
          className="h-10 w-full min-w-[140px]"
          aria-label="Start date"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="filter-end" className="text-xs font-medium text-muted-foreground">
          End Date
        </Label>
        <Input
          id="filter-end"
          type="date"
          value={endDate ?? ''}
          onChange={(e) => setEndDate(e.target.value ?? initEnd)}
          className="h-10 w-full min-w-[140px]"
          aria-label="End date"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="filter-category" className="text-xs font-medium text-muted-foreground">
          Category
        </Label>
        <Select value={category ?? 'All'} onValueChange={(v) => setCategory(v ?? 'All')}>
          <SelectTrigger id="filter-category" className="h-10 min-w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {(DEFAULT_CATEGORIES ?? []).map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="filter-segment" className="text-xs font-medium text-muted-foreground">
          Buyer Segment
        </Label>
        <Select value={buyerSegment ?? 'All'} onValueChange={(v) => setBuyerSegment(v ?? 'All')}>
          <SelectTrigger id="filter-segment" className="h-10 min-w-[140px]">
            <SelectValue placeholder="Buyer segment" />
          </SelectTrigger>
          <SelectContent>
            {(BUYER_SEGMENTS ?? []).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleApply} className="bg-primary text-primary-foreground">
          Apply
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  )
}
