/**
 * TransactionList - List or grid of transaction cards.
 */
import { TransactionCard } from './transaction-card'
import type { Transaction } from '@/types/transaction-history'
import { cn } from '@/lib/utils'

export interface TransactionListProps {
  transactions: Transaction[]
  onSelect: (t: Transaction) => void
  onViewInvoice?: (t: Transaction) => void
  onViewTracking?: (t: Transaction) => void
  onDispute?: (t: Transaction) => void
  className?: string
}

export function TransactionList({
  transactions,
  onSelect,
  onViewInvoice,
  onViewTracking,
  onDispute,
  className,
}: TransactionListProps) {
  const list = Array.isArray(transactions) ? transactions : []

  if (list.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 py-16 px-6',
          className
        )}
        role="status"
        aria-label="No transactions"
      >
        <p className="text-center text-muted-foreground">
          No transactions found. Try adjusting your filters.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn('grid gap-4 sm:grid-cols-1 lg:grid-cols-2', className)}
      role="list"
      aria-label="Transaction list"
    >
      {list.map((t) => (
        <div key={t?.id ?? ''} role="listitem">
          <TransactionCard
            transaction={t}
            onViewDetails={onSelect}
            onViewInvoice={onViewInvoice}
            onViewTracking={onViewTracking}
            onDispute={onDispute}
          />
        </div>
      ))}
    </div>
  )
}
