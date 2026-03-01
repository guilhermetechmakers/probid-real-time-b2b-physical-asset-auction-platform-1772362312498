/**
 * AuditTrailPanel - Chronological list of events with actor, timestamp, action, notes.
 */
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { History } from 'lucide-react'
import type { AuditTrailEvent } from '@/types/transaction-history'

export interface AuditTrailPanelProps {
  events: AuditTrailEvent[]
  className?: string
}

const ACTION_LABELS: Record<string, string> = {
  dispute_initiated: 'Dispute initiated',
  evidence_added: 'Evidence added',
  status_updated: 'Status updated',
  resolved: 'Resolved',
  rejected: 'Rejected',
}

export function AuditTrailPanel({ events, className }: AuditTrailPanelProps) {
  const list = Array.isArray(events) ? events : []

  if (list.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 p-8',
          className
        )}
      >
        <History className="h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No audit events yet</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-card p-6 shadow-card',
        className
      )}
    >
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
        Audit Trail
      </h4>
      <div className="space-y-3">
        {list.map((e) => (
          <div
            key={e?.id ?? ''}
            className="flex flex-col gap-1 rounded-lg border border-[rgb(var(--border))] px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {ACTION_LABELS[e?.action ?? ''] ?? e?.action ?? 'Unknown'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(e?.timestamp ?? '')}
              </span>
            </div>
            {e?.notes && (
              <p className="text-xs text-muted-foreground">{e.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
