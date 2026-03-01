/**
 * Step 1: Identifier Entry - Input for asset identifier with async enrichment status.
 */

import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { EnrichmentStatus } from '@/types'

interface StepIdentifierEntryProps {
  identifier: string
  onIdentifierChange: (value: string) => void
  enrichmentStatus?: EnrichmentStatus
  onEnrich: () => void
  isEnriching: boolean
  onNext: () => void
  onBack?: () => void
  canProceed: boolean
}

export function StepIdentifierEntry({
  identifier,
  onIdentifierChange,
  enrichmentStatus,
  onEnrich,
  isEnriching,
  onNext,
  onBack,
  canProceed,
}: StepIdentifierEntryProps) {
  return (
    <div className="space-y-6 animate-in">
      <div className="space-y-2">
        <Label htmlFor="identifier">Asset Identifier (Serial / VIN)</Label>
        <div className="flex gap-2">
          <Input
            id="identifier"
            placeholder="e.g. ABC123456 or VIN"
            value={identifier}
            onChange={(e) => onIdentifierChange(e.target.value)}
            onBlur={() => identifier.trim() && onEnrich()}
            className="flex-1"
            aria-describedby="identifier-hint identifier-status"
          />
          <div
            id="identifier-status"
            className="flex items-center justify-center w-10 rounded-lg bg-[rgb(var(--secondary))]"
            aria-live="polite"
          >
            {isEnriching && (
              <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
            )}
            {!isEnriching && enrichmentStatus === 'complete' && (
              <CheckCircle className="h-5 w-5 text-success" aria-label="Enrichment complete" />
            )}
            {!isEnriching && enrichmentStatus === 'failed' && (
              <AlertCircle className="h-5 w-5 text-destructive" aria-label="Enrichment failed" />
            )}
            {!isEnriching && enrichmentStatus === 'pending' && (
              <span className="text-muted-foreground text-xs">—</span>
            )}
          </div>
        </div>
        <p id="identifier-hint" className="text-sm text-muted-foreground">
          Enter a unique identifier to auto-fill specs from our enrichment service.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        {onBack ? (
          <Button variant="outline" onClick={onBack} type="button">
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          onClick={onNext}
          disabled={!canProceed || isEnriching}
          className="hover:scale-[1.02] transition-transform"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
