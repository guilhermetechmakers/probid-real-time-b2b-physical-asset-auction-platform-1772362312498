/**
 * DepositCartList - Renders list of deposit holds with empty state.
 * Runtime safety: (deposits ?? []).map, Array.isArray checks.
 */
import { DepositCard } from './deposit-card'
import { ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DepositHold } from '@/types/deposits'

export interface DepositCartListProps {
  deposits: DepositHold[]
  onExtend?: (depositId: string) => void
  onRelease?: (depositId: string) => void
  onCheckout?: (deposit: DepositHold) => void
  extendingId?: string | null
  releasingId?: string | null
  className?: string
}

export function DepositCartList({
  deposits,
  onExtend,
  onRelease,
  onCheckout,
  extendingId,
  releasingId,
  className,
}: DepositCartListProps) {
  const list = Array.isArray(deposits) ? deposits : []
  const totalPending = list
    .filter((d) => (d?.status ?? '') === 'holding')
    .reduce((sum, d) => sum + (d?.amount ?? 0), 0)

  if (list.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--border))] bg-secondary/30 px-8 py-16 text-center',
          className
        )}
      >
        <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No deposit holds</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add deposits when you participate in auctions. Deposit requirements will appear here once you bid or add items to your watchlist.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {totalPending > 0 && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Total pending holds:{' '}
            <span className="font-semibold text-foreground">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: list[0]?.currency ?? 'USD',
              }).format(totalPending)}
            </span>
          </p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {(list ?? []).map((deposit) => (
          <DepositCard
            key={deposit?.id ?? ''}
            deposit={deposit}
            onExtend={onExtend}
            onRelease={onRelease}
            onCheckout={onCheckout}
            isExtending={extendingId === deposit?.id}
            isReleasing={releasingId === deposit?.id}
          />
        ))}
      </div>
    </div>
  )
}
