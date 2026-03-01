/**
 * RelatedListingsPanel - Suggestions with quick access.
 */
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Gavel } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { RelatedListingSummary } from '@/api/listing-detail'

export interface RelatedListingsPanelProps {
  listings?: RelatedListingSummary[]
  isLoading?: boolean
  className?: string
}

export function RelatedListingsPanel({
  listings = [],
  isLoading = false,
  className,
}: RelatedListingsPanelProps) {
  const safe = Array.isArray(listings) ? listings : []

  if (safe.length === 0 && !isLoading) return null

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader>
        <CardTitle>Related listings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-[rgb(var(--muted))]"
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {(safe ?? []).map((item) => (
              <li key={item.id}>
                <Link
                  to={`/listing/${item.id}`}
                  className={cn(
                    'flex gap-4 rounded-xl border border-[rgb(var(--border))] p-3 transition-all duration-200',
                    'hover:border-primary/50 hover:shadow-accent-glow'
                  )}
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt=""
                      className="h-16 w-20 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--secondary))]">
                      <Gavel className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.title}</p>
                    {item.identifier && (
                      <p className="text-xs text-muted-foreground">
                        {item.identifier}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-bold text-primary">
                      {item.currentBid != null && item.currentBid > 0
                        ? formatCurrency(item.currentBid)
                        : item.reservePrice != null
                          ? `Reserve: ${formatCurrency(item.reservePrice)}`
                          : '—'}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
