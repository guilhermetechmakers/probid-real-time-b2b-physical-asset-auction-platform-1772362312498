/**
 * SavedFiltersPanel - Quick-load saved searches with apply/edit/delete.
 */

import { useState } from 'react'
import { Filter, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SavedSearchCard } from './saved-search-card'
import {
  createSavedFilter,
  deleteSavedFilter,
} from '@/api/buyer'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { SavedFilter } from '@/types'

interface SavedFiltersPanelProps {
  filters: SavedFilter[]
  onApply?: (filter: SavedFilter) => void
  onFiltersChange?: (filters: SavedFilter[]) => void
  className?: string
}

export function SavedFiltersPanel({
  filters,
  onApply,
  onFiltersChange,
  className,
}: SavedFiltersPanelProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [applyingId, setApplyingId] = useState<string | null>(null)

  const safeFilters = Array.isArray(filters) ? filters : []

  const handleSave = async () => {
    if (!newName.trim()) return
    setIsSaving(true)
    try {
      const created = await createSavedFilter(newName.trim(), {})
      onFiltersChange?.([created, ...safeFilters])
      setNewName('')
      setShowAdd(false)
      toast.success('Filter saved')
    } catch {
      toast.error('Failed to save filter')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSavedFilter(id)
      onFiltersChange?.(safeFilters.filter((f) => f.id !== id))
      toast.success('Filter removed')
    } catch {
      toast.error('Failed to delete filter')
    }
  }

  const handleApply = (filter: SavedFilter) => {
    setApplyingId(filter.id)
    onApply?.(filter)
    setTimeout(() => setApplyingId(null), 500)
  }

  return (
    <Card className={cn('rounded-2xl border border-[rgb(var(--border))] shadow-card', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-5 w-5 text-primary" />
          Saved Filters
          <span className="text-sm font-normal text-muted-foreground">({safeFilters.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd ? (
          <div className="space-y-3 rounded-xl border border-[rgb(var(--border))] p-4">
            <Label htmlFor="filter-name">Filter name</Label>
            <Input
              id="filter-name"
              placeholder="e.g. Industrial Equipment"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={isSaving || !newName.trim()}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setNewName('') }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Save current filters
          </Button>
        )}

        {safeFilters.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved filters. Save your search criteria for quick access.
          </p>
        ) : (
          <div className="space-y-2">
            {safeFilters.map((filter) => (
              <SavedSearchCard
                key={filter.id}
                filter={filter}
                onApply={handleApply}
                onDelete={handleDelete}
                isApplying={applyingId === filter.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
