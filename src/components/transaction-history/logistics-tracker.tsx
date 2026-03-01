/**
 * LogisticsTracker - Status timeline, carrier, tracking number, milestones.
 */
import { formatDate, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Package, CheckCircle, Clock } from 'lucide-react'
import type { LogisticsRef, LogisticsMilestone } from '@/types/transaction-history'

export interface LogisticsTrackerProps {
  trackingInfo: LogisticsRef | null | undefined
  className?: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  failed: 'Failed',
}

export function LogisticsTracker({ trackingInfo, className }: LogisticsTrackerProps) {
  if (!trackingInfo?.id) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 p-8',
          className
        )}
      >
        <Package className="h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No logistics information yet</p>
      </div>
    )
  }

  const milestones = Array.isArray(trackingInfo?.milestones) ? trackingInfo.milestones : []
  const statusLabel = STATUS_LABELS[trackingInfo?.status ?? 'pending'] ?? 'Pending'

  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-card p-6 shadow-card',
        className
      )}
    >
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
        Shipping Status
      </h4>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          {trackingInfo?.carrier && (
            <div>
              <span className="text-muted-foreground">Carrier:</span>{' '}
              <span className="font-medium">{trackingInfo.carrier}</span>
            </div>
          )}
          {trackingInfo?.trackingNumber && (
            <div>
              <span className="text-muted-foreground">Tracking:</span>{' '}
              <span className="font-mono font-medium">{trackingInfo.trackingNumber}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Status:</span>{' '}
            <span className="font-medium">{statusLabel}</span>
          </div>
        </div>
        {trackingInfo?.shippedAt && (
          <p className="text-xs text-muted-foreground">
            Shipped: {formatDateTime(trackingInfo.shippedAt)}
          </p>
        )}
        {trackingInfo?.estimatedDelivery && (
          <p className="text-xs text-muted-foreground">
            Est. delivery: {formatDate(trackingInfo.estimatedDelivery)}
          </p>
        )}
        {milestones.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Timeline</p>
            <div className="space-y-2">
              {milestones.map((m: LogisticsMilestone, i: number) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2',
                    m.completed ? 'bg-success/10' : 'bg-[rgb(var(--secondary))]'
                  )}
                >
                  {m.completed ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-sm">{m.label}</span>
                  {m.timestamp && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatDateTime(m.timestamp)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
