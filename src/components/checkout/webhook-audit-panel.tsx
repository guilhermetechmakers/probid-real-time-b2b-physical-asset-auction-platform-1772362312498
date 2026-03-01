/**
 * WebhookAuditPanel - Admin-friendly: idempotency keys, last webhook events.
 */
import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { WebhookAuditEntry } from '@/types/checkout'

export interface WebhookAuditPanelProps {
  entries: WebhookAuditEntry[]
  isLoading?: boolean
  isAdmin?: boolean
  className?: string
}

export function WebhookAuditPanel({
  entries,
  isLoading = false,
  isAdmin = false,
  className,
}: WebhookAuditPanelProps) {
  if (!isAdmin) return null

  const safeEntries = Array.isArray(entries) ? entries : []
  const recent = safeEntries.slice(0, 10)

  return (
    <Card
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] shadow-card',
        className
      )}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Shield className="h-5 w-5 text-muted-foreground" />
          Webhook Audit
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-[rgb(var(--muted))]"
              />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No webhook events yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{e.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.eventId} • {e.processedAt}
                  </p>
                </div>
                <Badge
                  variant={e.status === 'ERROR' ? 'destructive' : 'success'}
                >
                  {e.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
