/**
 * IdentifierEnrichmentStatus - Compact status line with link to enrichment results.
 */

import { Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface IdentifierEnrichmentStatusProps {
  enrichmentStatus?: string
  lastUpdated?: string
  onViewEnrichment?: () => void
  identifier?: string
  className?: string
}

export function IdentifierEnrichmentStatus({
  enrichmentStatus = 'Pending',
  lastUpdated,
  onViewEnrichment,
  identifier,
  className,
}: IdentifierEnrichmentStatusProps) {
  const statusColor =
    enrichmentStatus === 'Complete'
      ? 'text-success'
      : enrichmentStatus === 'Failed'
        ? 'text-destructive'
        : 'text-muted-foreground'

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/50 px-4 py-2 text-sm',
        className
      )}
    >
      <Link2 className="h-4 w-4 text-muted-foreground" />
      {identifier && (
        <span className="font-medium">Identifier: {identifier}</span>
      )}
      <span className={statusColor}>Enrichment: {enrichmentStatus}</span>
      {lastUpdated && (
        <span className="text-xs text-muted-foreground">
          Updated {new Date(lastUpdated).toLocaleDateString()}
        </span>
      )}
      {onViewEnrichment && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewEnrichment}
          className="h-auto py-1 text-xs"
        >
          View details
        </Button>
      )}
    </div>
  )
}
