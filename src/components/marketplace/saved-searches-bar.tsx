/**
 * SavedSearchesBar - Save current filters, load saved configs, delete saved searches.
 * Requires authenticated buyer; uses saved_filters from buyer API.
 */

import { useState } from 'react'
import { Filter, Loader2, Save, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useBuyerDashboard } from '@/hooks/use-buyer-dashboard'
import {
  createSavedFilter,
  deleteSavedFilter,
} from '@/api/buyer'
import type { ListingFilters } from '@/types/marketplace'
import type { SavedFilter } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SavedSearchesBarProps {
  currentFilters: ListingFilters
  onApplyFilters: (filters: ListingFilters) => void
  isAuthenticated?: boolean
  className?: string
}

function filtersToSavedFilterFormat(f: ListingFilters): SavedFilter['filters'] {
  return {
    category: f.category,
    location: f.location,
    condition: f.condition,
    priceMin: f.priceMin,
    priceMax: f.priceMax,
  }
}

function savedFilterToFilters(f: SavedFilter['filters']): ListingFilters {
  return {
    category: f?.category,
    location: f?.location,
    condition: f?.condition,
    priceMin: f?.priceMin,
    priceMax: f?.priceMax,
  }
}

export function SavedSearchesBar({
  currentFilters,
  onApplyFilters,
  isAuthenticated = false,
  className,
}: SavedSearchesBarProps) {
  const { data, refetch } = useBuyerDashboard()
  const savedFilters = Array.isArray(data?.savedFilters) ? data.savedFilters : []
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Sign in to save searches')
      return
    }
    const name = window.prompt('Name this search')
    if (!name?.trim()) return
    setSaving(true)
    try {
      await createSavedFilter(name.trim(), filtersToSavedFilterFormat(currentFilters))
      toast.success('Search saved')
      refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleApply = (filter: SavedFilter) => {
    onApplyFilters(savedFilterToFilters(filter.filters))
    toast.success(`Applied "${filter.name}"`)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await deleteSavedFilter(id)
      toast.success('Search deleted')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSave}
        disabled={saving}
        className="hover:border-primary"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        <span className="ml-1.5">Save search</span>
      </Button>
      {savedFilters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hover:border-primary">
              <Filter className="h-4 w-4" />
              <span className="ml-1.5">Saved</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {(savedFilters ?? []).map((sf) => (
              <DropdownMenuItem
                key={sf.id}
                onSelect={() => handleApply(sf)}
                className="flex items-center justify-between"
              >
                <span className="truncate">{sf.name}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
                  onClick={(e) => handleDelete(e, sf.id)}
                  aria-label={`Delete ${sf.name}`}
                >
                  ×
                </Button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
