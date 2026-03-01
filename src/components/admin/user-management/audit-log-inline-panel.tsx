/**
 * AuditLogInlinePanel - Displays immutable audit entries with filters.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Filter, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { fetchAuditLogsByUserId } from '@/api/admin'
import type { AuditLogEntry } from '@/types/admin'

interface AuditLogInlinePanelProps {
  userId: string
  maxHeight?: string
}

const ACTION_OPTIONS = [
  '',
  'user_banned',
  'user_unbanned',
  'user_restricted',
  'user_restriction_removed',
  'subscription_changed',
  'kyc_resend_requested',
  'buyer_approve',
  'buyer_deny',
  'listing_approved',
  'listing_rejected',
]

export function AuditLogInlinePanel({ userId, maxHeight = '320px' }: AuditLogInlinePanelProps) {
  const [actionFilter, setActionFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs-user', userId, actionFilter, fromDate, toDate],
    queryFn: () =>
      fetchAuditLogsByUserId(userId, {
        action: actionFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      }),
  })

  const filtered = (logs ?? []).filter((l) => {
    if (actionFilter && l.action !== actionFilter) return false
    if (fromDate && new Date(l.timestamp) < new Date(fromDate)) return false
    if (toDate && new Date(l.timestamp) > new Date(toDate + 'T23:59:59')) return false
    return true
  })

  const handleExport = () => {
    const csv = [
      ['Action', 'Actor', 'Timestamp', 'Details'].join(','),
      ...(filtered ?? []).map((l) =>
        [
          l.action,
          l.actorEmail ?? l.actorId ?? '',
          l.timestamp,
          JSON.stringify(l.metadata ?? {}).replace(/,/g, ';'),
        ].join(',')
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${userId}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5" />
          Audit Log
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleExport} aria-label="Export audit logs">
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All actions</SelectItem>
              {ACTION_OPTIONS.filter(Boolean).map((a) => (
                <SelectItem key={a} value={a}>
                  {a.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From"
            className="w-[140px]"
          />
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To"
            className="w-[140px]"
          />
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (filtered ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No audit logs found</p>
        ) : (
          <div
            className="overflow-y-auto rounded-xl border border-[rgb(var(--border))]"
            style={{ maxHeight }}
          >
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-secondary/95">
                <tr className="border-b border-[rgb(var(--border))]">
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {(filtered ?? []).map((log: AuditLogEntry) => (
                  <tr
                    key={log.id}
                    className="border-b border-[rgb(var(--border))] transition-colors hover:bg-secondary/50"
                  >
                    <td className="px-4 py-3 font-medium">{log.action.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.actorEmail ?? log.actorId ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
