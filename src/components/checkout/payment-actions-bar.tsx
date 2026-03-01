/**
 * PaymentActionsBar - CTA area with Pay Now / Capture Deposit, idempotency indicator.
 */
import { Button } from '@/components/ui/button'
import { Loader2, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaymentActionsBarProps {
  label?: string
  onClick?: () => void
  isLoading?: boolean
  disabled?: boolean
  idempotencyKey?: string
  status?: string
  className?: string
}

export function PaymentActionsBar({
  label = 'Pay Now',
  onClick,
  isLoading = false,
  disabled = false,
  idempotencyKey,
  status,
  className,
}: PaymentActionsBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-[rgb(var(--border))] bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-1">
        {idempotencyKey != null && idempotencyKey !== '' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" aria-hidden />
            <span>Idempotency: {idempotencyKey.slice(0, 8)}…</span>
          </div>
        )}
        {status != null && status !== '' && (
          <p className="text-sm font-medium">{status}</p>
        )}
      </div>
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="min-w-[140px] uppercase"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {label}
      </Button>
    </div>
  )
}
