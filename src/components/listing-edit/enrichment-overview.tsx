/**
 * EnrichmentOverview - Pre-filled specs vs edited values, status indicators.
 */

import { RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { EnrichmentResultEdit } from '@/types/listing-edit'
import { cn } from '@/lib/utils'

export interface EnrichmentOverviewProps {
  enrichmentResults: EnrichmentResultEdit | null | undefined
  onRetry?: () => void
  isRetrying?: boolean
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  Pending: 'secondary',
  Complete: 'success',
  Failed: 'destructive',
  partial: 'warning',
}

export function EnrichmentOverview({
  enrichmentResults,
  onRetry,
  isRetrying = false,
}: EnrichmentOverviewProps) {
  const status = String(enrichmentResults?.status ?? 'Pending')
  const results = enrichmentResults?.results ?? {}
  const statusVariant = STATUS_VARIANTS[status] ?? 'secondary'

  const entries = Object.entries(results).filter(([, v]) => v != null && v !== '')

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Enrichment</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant}>{status}</Badge>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying || status === 'Complete'}
              className="gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', isRetrying && 'animate-spin')} />
              Retry
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            {entries.map(([key, value]) => (
              <div key={key}>
                <dt className="font-medium text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </dt>
                <dd className="mt-0.5 font-medium">{String(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              {status === 'Pending'
                ? 'Enrichment in progress…'
                : status === 'Failed'
                  ? 'Enrichment failed. Use Retry to try again.'
                  : 'No enrichment data yet'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
