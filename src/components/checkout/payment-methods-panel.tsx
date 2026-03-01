/**
 * PaymentMethodsPanel - Lists saved Stripe payment methods, add new via Elements.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types/checkout'

export interface PaymentMethodsPanelProps {
  methods?: PaymentMethod[]
  isLoading?: boolean
  selectedId?: string
  onSelect?: (id: string) => void
  onAddNew?: () => void
  addNewLabel?: string
  /** When user adds a new card, we may have selectedId not in methods list */
  additionalSelectedLabel?: string
  className?: string
}

export function PaymentMethodsPanel({
  methods = [],
  isLoading = false,
  selectedId,
  onSelect,
  onAddNew,
  addNewLabel = 'Add payment method',
  additionalSelectedLabel,
  className,
}: PaymentMethodsPanelProps) {
  const safeMethods = Array.isArray(methods) ? methods : []
  const hasAdditionalSelected =
    selectedId != null &&
    selectedId !== '' &&
    !safeMethods.some((m) => m.id === selectedId)

  return (
    <Card
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-card shadow-card transition-all duration-300',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold uppercase tracking-wide">
          Payment Methods
        </CardTitle>
        {onAddNew != null && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddNew}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {addNewLabel}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        ) : safeMethods.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[rgb(var(--border))] py-8 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No saved payment methods</p>
            {onAddNew != null && (
              <Button onClick={onAddNew} size="sm">
                {addNewLabel}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {hasAdditionalSelected && additionalSelectedLabel != null && (
              <button
                type="button"
                onClick={() => onSelect?.(selectedId!)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200',
                  'border-primary bg-primary/5 ring-2 ring-primary/30'
                )}
                aria-pressed={true}
              >
                <CreditCard className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="font-medium">{additionalSelectedLabel}</span>
              </button>
            )}
            {safeMethods.map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => onSelect?.(pm.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200',
                  'hover:border-primary/50 hover:shadow-sm',
                  selectedId === pm.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                    : 'border-[rgb(var(--border))]'
                )}
                aria-pressed={selectedId === pm.id}
                aria-label={`Select ${pm.brand ?? 'card'} ending in ${pm.last4 ?? '****'}`}
              >
                <CreditCard className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium capitalize">
                    {pm.brand ?? 'Card'} •••• {pm.last4 ?? '****'}
                  </p>
                  {pm.expMonth != null && pm.expYear != null && (
                    <p className="text-xs text-muted-foreground">
                      Expires {String(pm.expMonth).padStart(2, '0')}/{pm.expYear}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
