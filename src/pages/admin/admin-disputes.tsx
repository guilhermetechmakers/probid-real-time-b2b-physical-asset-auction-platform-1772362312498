/**
 * Admin Dispute Management - Resolve disputes.
 */
import { DisputeManagement } from '@/components/admin'

export function AdminDisputesPage() {
  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dispute Management</h1>
        <p className="mt-1 text-muted-foreground">
          Review and resolve open disputes
        </p>
      </div>
      <DisputeManagement />
    </div>
  )
}
