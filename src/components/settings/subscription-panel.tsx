/**
 * SubscriptionPanel - Current plan, renewal, invoices, upgrade/downgrade.
 */
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, FileText, TrendingUp } from 'lucide-react'
import { fetchSubscription, fetchInvoices } from '@/api/settings'
import type { SubscriptionInfo, Invoice } from '@/types/settings'
import { toast } from 'sonner'

export function SubscriptionPanel() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInvoices, setShowInvoices] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchSubscription(), fetchInvoices()]).then(([sub, inv]) => {
      if (cancelled) return
      setSubscription(sub)
      setInvoices(Array.isArray(inv) ? inv : [])
      setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const handleUpgrade = () => {
    toast.info('Stripe Checkout will open for plan upgrade')
  }

  const handleManagePayment = () => {
    toast.info('Stripe Customer Portal will open')
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card">
        <CardHeader>
          <div className="h-6 w-36 animate-pulse rounded bg-[rgb(var(--muted))]" />
          <div className="h-4 w-64 animate-pulse rounded bg-[rgb(var(--muted))]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-20 animate-pulse rounded-lg bg-[rgb(var(--muted))]" />
          <div className="h-11 w-32 animate-pulse rounded-lg bg-[rgb(var(--muted))]" />
        </CardContent>
      </Card>
    )
  }

  const planName = subscription?.planName ?? subscription?.planId ?? 'Free'
  const status = subscription?.status ?? 'inactive'
  const statusVariant = status === 'active' ? 'success' : status === 'past_due' ? 'destructive' : 'secondary'

  return (
    <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          Manage your buyer subscription (required for bidding)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-probid-charcoal">
              <TrendingUp className="h-6 w-6 text-probid-accent" />
            </div>
            <div>
              <p className="font-semibold">{planName}</p>
              <Badge variant={statusVariant} className="mt-1">
                {status}
              </Badge>
            </div>
          </div>
          {subscription?.nextBillingDate && (
            <div className="text-right text-sm text-muted-foreground">
              <p>Renews {formatDate(subscription.nextBillingDate)}</p>
              {subscription?.nextBillingAmount != null && (
                <p className="font-medium text-foreground">
                  {formatCurrency(subscription.nextBillingAmount, subscription.currency ?? 'USD')}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleUpgrade}
            className="bg-probid-charcoal text-probid-accent hover:bg-probid-charcoal/90"
          >
            Upgrade plan
          </Button>
          <Button variant="outline" onClick={handleManagePayment}>
            <CreditCard className="h-4 w-4" />
            Manage payment methods
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowInvoices(!showInvoices)}
          >
            <FileText className="h-4 w-4" />
            View invoices
          </Button>
        </div>

        {showInvoices && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Invoices</p>
            {(invoices ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            ) : (
              <ul className="space-y-2">
                {(invoices ?? []).map((inv) => (
                  <li
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-3 text-sm"
                  >
                    <span>{formatDate(inv.periodStart ?? inv.createdAt ?? '')}</span>
                    <span>{formatCurrency(inv.amountDue, inv.currency)}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={inv.status === 'paid' ? 'success' : 'secondary'}>
                        {inv.status}
                      </Badge>
                      {(inv.invoiceUrl ?? inv.invoicePdfUrl) && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={inv.invoiceUrl ?? inv.invoicePdfUrl} target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
