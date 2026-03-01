/**
 * Step 2: Enrichment Prefill - Displays prefilled specs with inline editing.
 */

import { useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DraftData, EnrichmentStatus } from '@/types'
interface StepEnrichmentPrefillProps {
  data: DraftData
  onDataChange: (data: Partial<DraftData>) => void
  enrichmentStatus?: EnrichmentStatus
  onNext: () => void
  onBack: () => void
}

const EDITABLE_FIELDS = [
  { key: 'make', label: 'Make' },
  { key: 'model', label: 'Model' },
  { key: 'year', label: 'Year' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
] as const

export function StepEnrichmentPrefill({
  data,
  onDataChange,
  enrichmentStatus,
  onNext,
  onBack,
}: StepEnrichmentPrefillProps) {
  const [isEditing, setIsEditing] = useState(false)

  const specs = (data.specs ?? data.enrichment ?? {}) as Record<string, unknown>
  const merged: Record<string, unknown> = {
    ...specs,
    title: data.title,
    description: data.description,
    make: data.make ?? (data.enrichment as Record<string, unknown>)?.make,
    model: data.model ?? (data.enrichment as Record<string, unknown>)?.model,
    year: data.year ?? (data.enrichment as Record<string, unknown>)?.year,
  }

  const handleFieldChange = (key: string, value: string) => {
    if (key === 'title' || key === 'description') {
      onDataChange({ [key]: value })
    } else {
      onDataChange({
        specs: { ...(data.specs ?? {}), [key]: value },
        enrichment: { ...(data.enrichment ?? {}), [key]: value },
      })
    }
  }

  const statusLabel =
    enrichmentStatus === 'complete'
      ? 'Complete'
      : enrichmentStatus === 'failed'
        ? 'Failed'
        : enrichmentStatus === 'pending'
          ? 'Pending'
          : '—'

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] px-4 py-2 bg-[rgb(var(--secondary))]/50">
        <span className="text-sm font-medium">Enrichment status</span>
        <span
          className={cn(
            'text-sm',
            enrichmentStatus === 'complete' && 'text-success',
            enrichmentStatus === 'failed' && 'text-destructive',
            enrichmentStatus === 'pending' && 'text-amber-600'
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Prefilled specs</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="gap-2"
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              Edit
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {EDITABLE_FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              value={String(merged[key] ?? '')}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              disabled={!isEditing}
              className={cn(!isEditing && 'bg-[rgb(var(--muted))]')}
            />
          </div>
        ))}
      </div>

      {Object.keys(specs).length > 0 && (
        <div className="rounded-lg border border-[rgb(var(--border))] p-4">
          <p className="text-sm font-medium mb-2">Additional specs</p>
          <pre className="text-xs overflow-auto max-h-32 bg-[rgb(var(--background))] p-3 rounded-lg">
            {JSON.stringify(specs, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} type="button">
          Back
        </Button>
        <Button onClick={onNext} className="hover:scale-[1.02] transition-transform">
          Next
        </Button>
      </div>
    </div>
  )
}
