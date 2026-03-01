/**
 * InvoiceSummaryCard - Displays sale price, fees, tax, discounts, total, payout to seller.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface InvoiceSummaryCardProps {
  salePrice: number
  fees: number
  tax: number
  discount?: number
  total: number
  currency?: string
  payoutToSeller?: number
  dueDate?: string
  status?: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'COMPLETE'
  className?: string
}

export function InvoiceSummaryCard({
  salePrice,
  fees,
  tax,
  discount = 0,
  total,
  currency = 'USD',
  payoutToSeller,
  dueDate,
  status = 'PENDING',
  className,
}: InvoiceSummaryCardProps) {
  const isPaid = status === 'PAID' || status === 'COMPLETE'

  return (
    <Card
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-card shadow-card transition-all duration-300',
        isPaid && 'border-success/30',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold uppercase tracking-wide">
          Invoice Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sale price</span>
          <span className="font-medium">{formatCurrency(salePrice, currency)}</span>
        </div>
        {fees > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform fee</span>
            <span className="font-medium">{formatCurrency(fees, currency)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">{formatCurrency(tax, currency)}</span>
          </div>
        )}
        {(discount ?? 0) > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span>Discount</span>
            <span>-{formatCurrency(discount, currency)}</span>
          </div>
        )}
        <div className="border-t border-[rgb(var(--border))] pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total due</span>
            <span className={cn(isPaid && 'text-success')}>
              {formatCurrency(total, currency)}
            </span>
          </div>
        </div>
        {payoutToSeller != null && payoutToSeller > 0 && (
          <div className="rounded-lg bg-[rgb(var(--secondary))] p-3">
            <p className="text-xs text-muted-foreground">Payout to seller</p>
            <p className="text-sm font-semibold">{formatCurrency(payoutToSeller, currency)}</p>
          </div>
        )}
        {dueDate != null && (
          <p className="text-xs text-muted-foreground">
            Due date: {formatDate(dueDate)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
