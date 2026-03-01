/**
 * TransactionHistoryPage - Order/Transaction History for Buyers and Sellers.
 */
import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import {
  FiltersBar,
  TransactionList,
  TransactionDetailsPanel,
  DisputeModal,
  CSVExportButton,
} from '@/components/transaction-history'
import { useTransactionHistory, useDisputeInitiate } from '@/hooks/use-transaction-history'
import { Skeleton } from '@/components/ui/skeleton'
import type { Transaction, TransactionHistoryFilters } from '@/types/transaction-history'

export function TransactionHistoryPage() {
  const { user } = useAuth()
  const role = user?.role === 'seller' ? 'seller' : 'buyer'
  const [filters, setFilters] = useState<TransactionHistoryFilters>({})
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [disputeTransaction, setDisputeTransaction] = useState<Transaction | null>(null)

  const { data: transactions = [], isLoading, error } = useTransactionHistory(role, filters)
  const initiateDispute = useDisputeInitiate(disputeTransaction?.id)

  const list = Array.isArray(transactions) ? transactions : []

  const handleSelect = useCallback((t: Transaction) => {
    setSelectedTransaction(t)
    setDetailsOpen(true)
  }, [])

  const handleInitiateDispute = useCallback((t: Transaction) => {
    setDisputeTransaction(t)
    setDisputeModalOpen(true)
  }, [])

  const handleSubmitDispute = useCallback(
    async (payload: { reason: string; description?: string; attachmentUrls?: string[] }) => {
      if (!disputeTransaction?.id) return
      try {
        const res = await initiateDispute.mutateAsync(payload)
        if (res?.disputeId) {
          setDisputeModalOpen(false)
          setDisputeTransaction(null)
          setDetailsOpen(false)
          setSelectedTransaction(null)
        } else if (res?.error) {
          throw new Error(res.error)
        }
      } catch (err) {
        throw err
      }
    },
    [disputeTransaction?.id, initiateDispute]
  )

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false)
    setSelectedTransaction(null)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {role === 'buyer'
              ? 'View your past purchases, invoices, and tracking'
              : 'View your sales, payouts, and logistics'}
          </p>
        </div>
        <CSVExportButton data={list} disabled={list.length === 0} />
      </div>

      <FiltersBar currentFilters={filters} onFiltersChange={setFilters} />

      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error instanceof Error ? error.message : 'Failed to load transactions'}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : (
        <TransactionList
          transactions={list}
          onSelect={handleSelect}
          onViewInvoice={(t) => {
            setSelectedTransaction(t)
            setDetailsOpen(true)
          }}
          onViewTracking={(t) => {
            setSelectedTransaction(t)
            setDetailsOpen(true)
          }}
          onDispute={handleInitiateDispute}
          className="animate-in-up"
        />
      )}

      <TransactionDetailsPanel
        transaction={selectedTransaction}
        open={detailsOpen}
        onClose={handleCloseDetails}
        onInitiateDispute={handleInitiateDispute}
      />

      <DisputeModal
        transaction={disputeTransaction}
        open={disputeModalOpen}
        onOpenChange={setDisputeModalOpen}
        onSubmitDispute={handleSubmitDispute}
        isSubmitting={initiateDispute.isPending}
      />
    </div>
  )
}
