/**
 * InvoiceSummaryCard - Displays sale price, fees, tax, discounts, total, payout to seller.
 */
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { InvoiceSummary } from '@/types/checkout'

export interface InvoiceSummaryCardProps {
  summary: InvoiceSummary | null
  listingTitle?: string
  className?: string
}

export function InvoiceSummaryCard({
  summary,
  listingTitle,
  className,
}: InvoiceSummaryCardProps) {
  if (!summary) {
    return (
      <Card className={cn('rounded-2xl shadow-card', className)}>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading invoice...</p>
        </CardContent>
      </Card>
    )
  }

  const { salePrice, fees, tax, discounts, total, currency, payoutToSeller, paymentDueDate } =
    summary

  return (
    <Card
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold tracking-tight">
          Invoice Summary
        </CardTitle>
        {listingTitle && (
          <p className="text-sm text-muted-foreground">{listingTitle}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Row label="Sale price" value={formatCurrency(salePrice, currency)} />
          <Row label="Platform fees" value={formatCurrency(fees, currency)} />
          <Row label="Tax" value={formatCurrency(tax, currency)} />
          {discounts > 0 && (
            <Row label="Discounts" value={`-${formatCurrency(discounts, currency)}`} />
          )}
        </div>
        <Separator className="bg-[rgb(var(--border))]" />
        <div className="flex justify-between">
          <span className="text-base font-bold">Total due</span>
          <span className="text-xl font-bold text-foreground">
            {formatCurrency(total, currency)}
          </span>
        </div>
        <Separator className="bg-[rgb(var(--border))]" />
        <div className="space-y-2 text-sm">
          <Row label="Payout to seller" value={formatCurrency(payoutToSeller, currency)} />
          <Row label="Payment due" value={formatDate(paymentDueDate)} />
        </div>
      </CardContent>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
