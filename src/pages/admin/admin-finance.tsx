/**
 * Admin Finance Panel - Revenue, fees, payouts.
 */
import { FinancePanel } from '@/components/admin'

export function AdminFinancePage() {
  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
        <p className="mt-1 text-muted-foreground">
          Revenue, fees, and payout reconciliation
        </p>
      </div>
      <FinancePanel />
    </div>
  )
}
