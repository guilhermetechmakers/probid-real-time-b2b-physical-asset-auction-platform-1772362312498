/**
 * StatusPill - Small badge for auction state (LIVE, EXTENDING, PAUSED, ENDED).
 */
import { cn } from '@/lib/utils'

export type AuctionStatusPill = 'live' | 'extending' | 'paused' | 'ended' | 'scheduled'

export interface StatusPillProps {
  status: AuctionStatusPill
  className?: string
}

export function StatusPill({ status, className }: StatusPillProps) {
  const config = {
    live: {
      label: 'LIVE',
      className: 'bg-primary text-primary-foreground border-primary shadow-accent-glow animate-pulse',
    },
    extending: {
      label: 'EXTENDING',
      className: 'bg-primary/80 text-primary-foreground border-primary',
    },
    paused: {
      label: 'PAUSED',
      className: 'bg-amber-500/20 text-amber-700 border-amber-500/50 dark:text-amber-400',
    },
    ended: {
      label: 'ENDED',
      className: 'bg-muted text-muted-foreground border-[rgb(var(--border))]',
    },
    scheduled: {
      label: 'UPCOMING',
      className: 'bg-secondary text-secondary-foreground border-[rgb(var(--border))]',
    },
  }

  const { label, className: statusClass } = config[status] ?? config.scheduled

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider',
        statusClass,
        className
      )}
      role="status"
      aria-live="polite"
    >
      {label}
    </span>
  )
}
