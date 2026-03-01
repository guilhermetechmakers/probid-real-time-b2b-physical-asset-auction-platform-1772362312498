/**
 * CheckoutModal - Stripe PaymentIntent confirmation for deposit capture.
 * PCI-compliant: no raw card data touches our server.
 * Uses clientSecret to confirm PaymentIntent, then calls capture API.
 */
import { useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { formatCurrency } from '@/lib/utils'
import { getDepositClientSecret } from '@/api/deposits'
import type { DepositHold } from '@/types/deposits'

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_placeholder'
)

interface PaymentFormProps {
  deposit: DepositHold
  onSuccess: () => void
  onCancel: () => void
  onCapture: (depositId: string, paymentMethodId: string) => Promise<{ success: boolean; error?: string }>
}

function PaymentForm({ deposit, onSuccess, onCancel, onCapture }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!stripe || !elements) return
      if (!deposit?.id) {
        setError('Invalid deposit')
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/dashboard/buyer/cart?depositId=${encodeURIComponent(deposit.id)}`,
            payment_method_data: {
              billing_details: {
                name: 'Deposit holder',
              },
            },
          },
        })
        if (confirmError) {
          setError(confirmError.message ?? 'Payment confirmation failed')
          setIsLoading(false)
          return
        }
        const result = await onCapture(deposit.id, '')
        if (result?.success) {
          onSuccess()
        } else {
          setError(result?.error ?? 'Capture failed')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    },
    [stripe, elements, deposit?.id, onCapture, onSuccess]
  )

  const amount = deposit?.amount ?? 0
  const currency = deposit?.currency ?? 'USD'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-[rgb(var(--border))] bg-secondary/50 p-4">
        <p className="text-sm font-medium">
          Capture {formatCurrency(amount, currency)} for deposit hold
        </p>
      </div>
      <div className="space-y-2">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      {error != null && (
        <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="uppercase">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Confirm capture
        </Button>
      </DialogFooter>
    </form>
  )
}

export interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deposit: DepositHold | null
  onCapture: (depositId: string, paymentMethodId: string) => Promise<{ success: boolean; error?: string }>
  onSuccess?: () => void
}

export function CheckoutModal({
  open,
  onOpenChange,
  deposit,
  onCapture,
  onSuccess,
}: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loadingSecret, setLoadingSecret] = useState(false)

  useEffect(() => {
    if (!open || !deposit?.id) {
      setClientSecret(null)
      return
    }
    setLoadingSecret(true)
    setClientSecret(null)
    getDepositClientSecret(deposit.id)
      .then((secret) => {
        setClientSecret(secret ?? null)
      })
      .finally(() => {
        setLoadingSecret(false)
      })
  }, [open, deposit?.id])

  const handleSuccess = useCallback(() => {
    onSuccess?.()
    onOpenChange(false)
  }, [onSuccess, onOpenChange])

  if (!deposit) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Capture deposit</DialogTitle>
        </DialogHeader>
        {loadingSecret ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: 'rgb(239, 253, 45)',
                  colorBackground: 'rgb(245, 246, 250)',
                  colorText: 'rgb(24, 24, 24)',
                  colorDanger: 'rgb(255, 77, 79)',
                },
              },
            }}
          >
            <PaymentForm
              deposit={deposit}
              onSuccess={handleSuccess}
              onCancel={() => onOpenChange(false)}
              onCapture={onCapture}
            />
          </Elements>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Payment setup is not available for this deposit. Please ensure Stripe is configured.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
