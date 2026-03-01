/**
 * AuditLogInlinePanel - Displays immutable audit entries for a user.
 */
import { useQuery } from '@tanstack/react-query'
import { FileText, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchAuditLogsByUserId } from '@/api/admin'
import type { AuditLogEntry } from '@/types/admin'

interface AuditLogInlinePanelProps {
  userId: string
  actionFilter?: string
  onActionFilterChange?: (action: string) => void
}

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'user_banned', label: 'User banned' },
  { value: 'user_unbanned', label: 'User unbanned' },
  { value: 'user_subscription_changed', label: 'Subscription changed' },
  { value: 'user_kyc_resend', label: 'KYC resend' },
  { value: 'buyer_approved', label: 'Buyer approved' },
  { value: 'buyer_denied', label: 'Buyer denied' },
]

export function AuditLogInlinePanel({ userId, actionFilter = '', onActionFilterChange }: AuditLogInlinePanelProps) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs-user', userId, actionFilter],
    queryFn: () =>
      fetchAuditLogsByUserId(userId, {
        action: actionFilter || undefined,
      }),
  })

  const entries = (logs ?? []) as AuditLogEntry[]

  return (
    <Card className="rounded-xl border-[rgb(var(--border))] shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Audit Log
          </CardTitle>
          {onActionFilterChange && (
            <Select value={actionFilter} onValueChange={onActionFilterChange}>
              <SelectTrigger className="h-8 w-[140px]">
                <Filter className="mr-1 h-3 w-3" />
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-lg" />
        ) : entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No audit entries</p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {entries.map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-0.5 rounded-lg border border-[rgb(var(--border))] bg-secondary/30 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                {log.actorEmail && (
                  <span className="text-xs text-muted-foreground">by {log.actorEmail}</span>
                )}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="mt-1 max-h-16 overflow-auto rounded bg-muted/50 px-2 py-1 text-xs">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
