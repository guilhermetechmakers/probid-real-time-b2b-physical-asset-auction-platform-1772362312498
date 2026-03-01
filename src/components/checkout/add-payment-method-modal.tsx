/**
 * AddPaymentMethodModal - Stripe CardElement for adding new payment method.
 * PCI-compliant: no raw card data touches our server.
 */
import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_placeholder'
)

interface CardFormProps {
  onSuccess: (paymentMethodId: string) => void
  onCancel: () => void
}

function CardForm({ onSuccess, onCancel }: CardFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!stripe || !elements) return
      setIsLoading(true)
      setError(null)
      try {
        const cardEl = elements.getElement(CardElement)
        if (!cardEl) {
          setError('Card element not ready')
          return
        }
        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardEl,
        })
        if (pmError) {
          setError(pmError.message ?? 'Failed to add card')
          return
        }
        if (paymentMethod?.id) {
          onSuccess(paymentMethod.id)
        } else {
          setError('Could not create payment method')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    },
    [stripe, elements, onSuccess]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Card details</Label>
        <div className="rounded-xl border border-[rgb(var(--input))] bg-[rgb(var(--secondary))] p-4 focus-within:ring-2 focus-within:ring-primary">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: 'rgb(var(--foreground))',
                  '::placeholder': { color: 'rgb(var(--muted-foreground))' },
                },
                invalid: { color: 'rgb(var(--destructive))' },
              },
            }}
          />
        </div>
      </div>
      {error != null && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Add card
        </Button>
      </DialogFooter>
    </form>
  )
}

export interface AddPaymentMethodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: (paymentMethodId: string) => void
}

export function AddPaymentMethodModal({
  open,
  onOpenChange,
  onAdded,
}: AddPaymentMethodModalProps) {
  const handleSuccess = useCallback(
    (id: string) => {
      onAdded(id)
      onOpenChange(false)
    },
    [onAdded, onOpenChange]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add payment method</DialogTitle>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <CardForm
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}
