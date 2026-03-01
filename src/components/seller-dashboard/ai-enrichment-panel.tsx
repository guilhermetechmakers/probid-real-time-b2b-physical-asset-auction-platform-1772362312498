import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEnrichmentResults } from '@/hooks/use-seller-dashboard'
import type { EnrichmentResult } from '@/types'

interface AIEnrichmentPanelProps {
  listingId: string
  onAccept?: (result: EnrichmentResult) => void
  onFlag?: (result: EnrichmentResult) => void
}

export function AIEnrichmentPanel({ listingId, onAccept, onFlag }: AIEnrichmentPanelProps) {
  const { data: results, isLoading, error } = useEnrichmentResults(listingId)

  const list = Array.isArray(results) ? results : []

  if (!listingId) return null

  if (error) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-destructive">Failed to load enrichment results.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <span className="text-sm font-medium">AI Enrichment</span>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-3/4 rounded bg-[rgb(var(--muted))]" />
            <div className="h-4 w-1/2 rounded bg-[rgb(var(--muted))]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardHeader>
          <span className="text-sm font-medium">AI Enrichment</span>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No enrichment results yet. Run enrichment after entering the identifier.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <span className="text-sm font-medium">AI Enrichment Results</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {list.map((r, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 ${
              r.hardFail
                ? 'border-destructive bg-destructive/5'
                : 'border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={r.hardFail ? 'destructive' : 'secondary'}>
                  {r.provider}
                </Badge>
                <span className="text-sm font-medium">
                  Confidence: {(r.confidence * 100).toFixed(0)}%
                </span>
              </div>
              {r.hardFail ? (
                <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 shrink-0 text-success" />
              )}
            </div>
            {r.warnings.length > 0 && (
              <div className="mt-2 flex gap-2 text-sm text-amber-600">
                <Info className="h-4 w-4 shrink-0" />
                <ul>
                  {r.warnings.map((w, j) => (
                    <li key={j}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            {Object.keys(r.dataJson ?? {}).length > 0 && (
              <pre className="mt-2 overflow-auto rounded-lg bg-[rgb(var(--background))] p-3 text-xs">
                {JSON.stringify(r.dataJson, null, 2)}
              </pre>
            )}
            <div className="mt-3 flex gap-2">
              {!r.hardFail && (
                <>
                  <Button size="sm" onClick={() => onAccept?.(r)}>
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onFlag?.(r)}>
                    Flag for review
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
