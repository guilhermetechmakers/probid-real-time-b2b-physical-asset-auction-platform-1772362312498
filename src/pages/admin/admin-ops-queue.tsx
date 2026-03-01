/**
 * Admin Ops Queue - Review and process listings.
 */
import { OpsReviewQueue } from '@/components/admin'

export function AdminOpsQueuePage() {
  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ops Review Queue</h1>
        <p className="mt-1 text-muted-foreground">
          Approve, reject, or request changes on listings
        </p>
      </div>
      <OpsReviewQueue />
    </div>
  )
}
