/**
 * Admin Buyer Approvals - Approve or deny buyer/KYC requests.
 */
import { BuyerApprovalsConsole } from '@/components/admin'

export function AdminBuyersPage() {
  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buyer Approvals</h1>
        <p className="mt-1 text-muted-foreground">
          Review and approve KYC submissions
        </p>
      </div>
      <BuyerApprovalsConsole />
    </div>
  )
}
