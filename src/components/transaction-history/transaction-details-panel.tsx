/**
 * TransactionDetailsPanel - Sidebar/drawer with invoice, payment, dispute, logistics.
 */
import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { X, FileText, AlertCircle } from 'lucide-react'
import { InvoiceViewer } from './invoice-viewer'
import { LogisticsTracker } from './logistics-tracker'
import { AuditTrailPanel } from './audit-trail-panel'
import { useDisputeAudit } from '@/hooks/use-transaction-history'
import type { Transaction } from '@/types/transaction-history'

export interface TransactionDetailsPanelProps {
  transaction: Transaction | null
  open: boolean
  onClose: () => void
  onInitiateDispute?: (t: Transaction) => void
  className?: string
}

export function TransactionDetailsPanel({
  transaction,
  open,
  onClose,
  onInitiateDispute,
  className,
}: TransactionDetailsPanelProps) {
  const [invoiceViewerOpen, setInvoiceViewerOpen] = useState(false)
  const disputeId = transaction?.dispute?.id
  const { data: auditEvents = [] } = useDisputeAudit(disputeId)
  const events = Array.isArray(auditEvents) ? auditEvents : []

  const handleInitiateDispute = useCallback(() => {
    if (transaction && onInitiateDispute) {
      onClose()
      onInitiateDispute(transaction)
    }
  }, [transaction, onInitiateDispute, onClose])

  if (!transaction) return null

  const hasDispute = Boolean(transaction?.dispute?.id)
  const canDispute =
    !hasDispute &&
    (transaction?.status === 'paid' || transaction?.status === 'pending')

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 transition-opacity duration-300',
          open ? 'bg-black/40' : 'pointer-events-none bg-transparent opacity-0'
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-[rgb(var(--border))] bg-card shadow-card transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
          className
        )}
        role="dialog"
        aria-label="Transaction details"
      >
        <div className="flex items-center justify-between border-b border-[rgb(var(--border))] p-4">
          <h2 className="text-lg font-bold">Transaction Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{transaction?.assetName ?? 'Asset'}</CardTitle>
                  <Badge
                    variant={
                      transaction?.status === 'paid'
                        ? 'success'
                        : transaction?.status === 'disputed'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {transaction?.status ?? 'pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">
                    {formatCurrency(transaction?.amount ?? 0, transaction?.currency ?? 'USD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{formatDate(transaction?.date ?? '')}</span>
                </div>
                {transaction?.settlementStatus && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Settlement</span>
                    <span>{transaction.settlementStatus}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {transaction?.invoice && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Invoice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Billed: {formatCurrency(transaction.invoice.billedAmount ?? 0, transaction?.currency ?? 'USD')}
                  </p>
                  {transaction.invoice.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Due: {formatDate(transaction.invoice.dueDate)}
                    </p>
                  )}
                  {(transaction.invoice.pdfUrl ?? transaction.invoice.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setInvoiceViewerOpen(true)}
                    >
                      <FileText className="h-4 w-4" />
                      View Invoice
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {transaction?.logistics && (
              <LogisticsTracker trackingInfo={transaction.logistics} />
            )}

            {hasDispute && transaction?.dispute && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Dispute
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Status:</span>{' '}
                    {transaction.dispute.status}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Reason:</span>{' '}
                    {transaction.dispute.reason}
                  </p>
                  {transaction.dispute.description && (
                    <p className="text-sm text-muted-foreground">
                      {transaction.dispute.description}
                    </p>
                  )}
                  <AuditTrailPanel events={events} />
                </CardContent>
              </Card>
            )}

            {canDispute && onInitiateDispute && (
              <Button
                variant="outline"
                className="w-full gap-2 border-destructive text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-[1.02]"
                onClick={handleInitiateDispute}
              >
                <AlertCircle className="h-4 w-4" />
                Initiate Dispute
              </Button>
            )}
          </div>
        </div>
      </aside>

      <InvoiceViewer
        invoiceUrl={transaction?.invoice?.pdfUrl ?? undefined}
        open={invoiceViewerOpen}
        onOpenChange={setInvoiceViewerOpen}
      />
    </>
  )
}
