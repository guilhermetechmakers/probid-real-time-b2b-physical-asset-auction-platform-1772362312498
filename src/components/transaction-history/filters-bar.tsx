/**
 * FiltersBar - Date range, status, auction/transaction ID search for transaction history.
 */
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import type { TransactionHistoryFilters, TransactionStatus } from '@/types/transaction-history'

export interface FiltersBarProps {
  currentFilters: TransactionHistoryFilters
  onFiltersChange: (filters: TransactionHistoryFilters) => void
  className?: string
}

const STATUS_OPTIONS: { value: TransactionStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'refunded', label: 'Refunded' },
]

export function FiltersBar({
  currentFilters,
  onFiltersChange,
  className,
}: FiltersBarProps) {
  const handleStartDate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...currentFilters, startDate: e.target.value || undefined })
    },
    [currentFilters, onFiltersChange]
  )

  const handleEndDate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...currentFilters, endDate: e.target.value || undefined })
    },
    [currentFilters, onFiltersChange]
  )

  const handleStatus = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value as TransactionStatus | ''
      onFiltersChange({ ...currentFilters, status: v || undefined })
    },
    [currentFilters, onFiltersChange]
  )

  const handleAuctionId = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...currentFilters, auctionId: e.target.value?.trim() || undefined })
    },
    [currentFilters, onFiltersChange]
  )

  const handleTransactionId = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...currentFilters, transactionId: e.target.value?.trim() || undefined })
    },
    [currentFilters, onFiltersChange]
  )

  const handleReset = useCallback(() => {
    onFiltersChange({})
  }, [onFiltersChange])

  const hasActiveFilters =
    currentFilters?.startDate ||
    currentFilters?.endDate ||
    currentFilters?.status ||
    currentFilters?.auctionId ||
    currentFilters?.transactionId

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-4 rounded-2xl border border-[rgb(var(--border))] bg-card p-4 shadow-card',
        className
      )}
      role="search"
      aria-label="Filter transactions"
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-start" className="text-xs text-muted-foreground">
          From
        </Label>
        <Input
          id="filter-start"
          type="date"
          value={currentFilters?.startDate ?? ''}
          onChange={handleStartDate}
          className="h-9 w-40"
          aria-label="Start date"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-end" className="text-xs text-muted-foreground">
          To
        </Label>
        <Input
          id="filter-end"
          type="date"
          value={currentFilters?.endDate ?? ''}
          onChange={handleEndDate}
          className="h-9 w-40"
          aria-label="End date"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-status" className="text-xs text-muted-foreground">
          Status
        </Label>
        <select
          id="filter-status"
          value={currentFilters?.status ?? ''}
          onChange={handleStatus}
          className="h-9 w-36 rounded-lg border-0 bg-[rgb(var(--secondary))] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Status filter"
        >
          {(STATUS_OPTIONS ?? []).map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-auction" className="text-xs text-muted-foreground">
          Auction ID
        </Label>
        <Input
          id="filter-auction"
          type="text"
          placeholder="Search by auction"
          value={currentFilters?.auctionId ?? ''}
          onChange={handleAuctionId}
          className="h-9 w-44"
          aria-label="Auction ID search"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="filter-transaction" className="text-xs text-muted-foreground">
          Transaction ID
        </Label>
        <Input
          id="filter-transaction"
          type="text"
          placeholder="Search by transaction"
          value={currentFilters?.transactionId ?? ''}
          onChange={handleTransactionId}
          className="h-9 w-44"
          aria-label="Transaction ID search"
        />
      </div>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1"
          aria-label="Reset filters"
        >
          <X className="h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  )
}
