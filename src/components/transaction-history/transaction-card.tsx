/**
 * TransactionCard - Compact summary with quick actions.
 */
import { useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  FileText,
  Truck,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import type { Transaction } from '@/types/transaction-history'

export interface TransactionCardProps {
  transaction: Transaction
  onViewDetails: (t: Transaction) => void
  onViewInvoice?: (t: Transaction) => void
  onViewTracking?: (t: Transaction) => void
  onDispute?: (t: Transaction) => void
  className?: string
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  const config = {
    paid: { label: 'Paid', variant: 'success' as const },
    pending: { label: 'Pending', variant: 'warning' as const },
    disputed: { label: 'Disputed', variant: 'destructive' as const },
    refunded: { label: 'Refunded', variant: 'secondary' as const },
  }
  const { label, variant } = config[status] ?? config.pending
  return <Badge variant={variant}>{label}</Badge>
}

export function TransactionCard({
  transaction,
  onViewDetails,
  onViewInvoice,
  onViewTracking,
  onDispute,
  className,
}: TransactionCardProps) {
  const hasInvoice = Boolean(transaction?.invoice?.pdfUrl ?? transaction?.invoice?.id)
  const hasLogistics = Boolean(transaction?.logistics?.id)
  const hasDispute = Boolean(transaction?.dispute?.id)
  const canDispute =
    !hasDispute &&
    (transaction?.status === 'paid' || transaction?.status === 'pending')

  const handleClick = useCallback(() => {
    onViewDetails(transaction)
  }, [transaction, onViewDetails])

  return (
    <Card
      className={cn(
        'cursor-pointer rounded-2xl border border-[rgb(var(--border))] bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/30 hover:-translate-y-0.5',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={`View details for ${transaction?.assetName ?? 'transaction'}`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[rgb(var(--secondary))]">
            {transaction?.thumbnailUrl ? (
              <img
                src={transaction.thumbnailUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <FileText className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate font-semibold text-foreground">
                {transaction?.assetName ?? 'Asset'}
              </h3>
              <StatusBadge status={transaction?.status ?? 'pending'} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatDate(transaction?.date ?? '')} ·{' '}
              {formatCurrency(transaction?.amount ?? 0, transaction?.currency ?? 'USD')}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {hasInvoice && onViewInvoice && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewInvoice(transaction)
                  }}
                  aria-label="View invoice"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Invoice
                </Button>
              )}
              {hasLogistics && onViewTracking && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewTracking(transaction)
                  }}
                  aria-label="View tracking"
                >
                  <Truck className="h-3.5 w-3.5" />
                  Tracking
                </Button>
              )}
              {hasDispute && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Dispute
                </Badge>
              )}
              {canDispute && onDispute && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDispute(transaction)
                  }}
                  aria-label="Initiate dispute"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  Dispute
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails(transaction)
                }}
                aria-label="View details"
              >
                Details
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
