/**
 * CheckoutPage - Post-auction checkout for winning buyers.
 * Invoice, payment methods, deposit flow, receipts.
 */
import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  useCheckoutInitialize,
  useCheckoutInvoice,
  useCheckoutDeposit,
  useCheckoutPay,
  useCheckoutCaptureDeposit,
  useCheckoutReceipt,
  useCheckoutPaymentMethods,
} from '@/hooks/use-checkout'
import {
  InvoiceSummaryCard,
  PaymentMethodsPanel,
  DepositHoldPanel,
  PaymentActionsBar,
  ReceiptDownloader,
  AddPaymentMethodModal,
  DataVisualizationRow,
} from '@/components/checkout'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function CheckoutPage() {
  const { auctionId } = useParams<{ auctionId: string }>()
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [idempotencyKey] = useState(() => crypto.randomUUID())

  const { data: initData, isLoading: initLoading, error: initError } = useCheckoutInitialize(auctionId)
  const { data: invoice, isLoading: invoiceLoading } = useCheckoutInvoice(auctionId)
  const invoiceId = invoice?.id ?? initData?.invoiceId
  const { data: deposit } = useCheckoutDeposit(auctionId)
  const { data: receiptData } = useCheckoutReceipt(invoiceId)
  const { data: methods = [], isLoading: methodsLoading } = useCheckoutPaymentMethods()

  const payMutation = useCheckoutPay(auctionId)
  const captureMutation = useCheckoutCaptureDeposit()

  const safeMethods = Array.isArray(methods) ? methods : []

  const dueAmount = initData?.dueAmount ?? (invoice != null
    ? Number(invoice?.amount ?? 0) + Number(invoice?.fees ?? 0) + Number(invoice?.tax ?? 0) - Number(invoice?.discount ?? 0)
    : 0)
  const salePrice = invoice?.amount ?? initData?.dueAmount ?? 0
  const fees = invoice?.fees ?? 0
  const tax = invoice?.tax ?? 0
  const discount = invoice?.discount ?? 0
  const total = dueAmount > 0 ? dueAmount : salePrice + fees + tax - discount
  const isPaid = invoice?.status === 'PAID' || invoice?.status === 'COMPLETE'
  const payoutToSeller = invoice
    ? Math.max(0, Number(invoice.amount ?? 0) - Number(invoice.fees ?? 0) - Number(invoice.tax ?? 0) + Number(invoice.discount ?? 0))
    : undefined

  const handlePay = useCallback(() => {
    const pmId = selectedPaymentMethodId?.trim()
    if (!pmId) {
      toast.error('Please select or add a payment method')
      return
    }
    if (!auctionId) return
    payMutation.mutate(
      { paymentMethodId: pmId, idempotencyKey },
      {
        onSuccess: (res) => {
          if (res?.paymentStatus === 'succeeded') {
            toast.success('Payment successful')
          } else if (res?.paymentStatus === 'requires_action') {
            toast.info('Additional verification required')
          } else {
            toast.error('Payment failed')
          }
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Payment failed')
        },
      }
    )
  }, [selectedPaymentMethodId, auctionId, idempotencyKey, payMutation])

  const handleAddPaymentMethod = useCallback((paymentMethodId: string) => {
    setSelectedPaymentMethodId(paymentMethodId)
    toast.success('Payment method added')
  }, [])

  const handleCaptureDeposit = useCallback(() => {
    if (!invoiceId) return
    captureMutation.mutate(invoiceId, {
      onSuccess: () => toast.success('Deposit captured'),
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Capture failed'),
    })
  }, [invoiceId, captureMutation])

  const isLoading = initLoading || invoiceLoading
  const hasError = initError != null

  if (!auctionId?.trim()) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16">
        <p className="text-muted-foreground">Invalid checkout link.</p>
        <Button asChild variant="outline">
          <Link to="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16">
        <p className="text-destructive">
          {initError instanceof Error ? initError.message : 'Unable to load checkout'}
        </p>
        <Button asChild variant="outline">
          <Link to="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/marketplace" aria-label="Back to marketplace">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-6 animate-in-up">
          {!isPaid && total > 0 && (
            <DataVisualizationRow
              paidAmount={0}
              totalAmount={total}
              label="Payment progress"
            />
          )}

          <InvoiceSummaryCard
            salePrice={salePrice}
            fees={fees}
            tax={tax}
            discount={discount}
            total={total}
            currency={initData?.currency ?? invoice?.currency ?? 'USD'}
            payoutToSeller={payoutToSeller}
            dueDate={invoice?.dueDate ?? initData?.depositInfo?.holdUntil}
            status={invoice?.status}
          />

          {!isPaid && (
            <>
              <PaymentMethodsPanel
                methods={safeMethods}
                isLoading={methodsLoading}
                selectedId={selectedPaymentMethodId}
                onSelect={setSelectedPaymentMethodId}
                onAddNew={() => setAddModalOpen(true)}
                additionalSelectedLabel={
                  selectedPaymentMethodId && !safeMethods.some((m) => m.id === selectedPaymentMethodId)
                    ? 'New card (selected)'
                    : undefined
                }
              />

              {invoice?.depositRequired === true && deposit != null && (
                <DepositHoldPanel
                  amount={deposit.amount}
                  status={deposit.status}
                  holdUntil={deposit.holdUntil}
                  capturedAt={deposit.capturedAt}
                  onCapture={handleCaptureDeposit}
                  isCapturing={captureMutation.isPending}
                />
              )}

              <PaymentActionsBar
                label="Pay Now"
                onClick={handlePay}
                isLoading={payMutation.isPending}
                disabled={!selectedPaymentMethodId}
                idempotencyKey={idempotencyKey}
                status={payMutation.isError ? 'Payment failed — try again' : undefined}
              />
            </>
          )}

          {(isPaid || invoice?.status === 'PAID') && (
            <ReceiptDownloader
              invoicePdfUrl={receiptData?.invoicePdfUrl ?? invoice?.invoicePdfUrl}
              receiptPdfUrl={receiptData?.receiptPdfUrl ?? invoice?.receiptPdfUrl}
              downloadUrl={receiptData?.downloadUrl}
            />
          )}
        </div>
      )}

      <AddPaymentMethodModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdded={handleAddPaymentMethod}
      />
    </div>
  )
}
