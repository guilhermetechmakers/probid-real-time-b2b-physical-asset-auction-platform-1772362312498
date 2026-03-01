/**
 * Admin Audit Logs - Immutable, searchable audit trail.
 */
import { AuditLogViewer } from '@/components/admin'

export function AdminAuditLogsPage() {
  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-muted-foreground">
          Immutable audit trail for compliance
        </p>
      </div>
      <AuditLogViewer />
    </div>
  )
}
