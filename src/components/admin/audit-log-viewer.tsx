/**
 * Audit Log Viewer - Immutable, searchable, filterable audit logs.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchAuditLogs } from '@/api/admin'

export function AuditLogViewer() {
  const [actionFilter, setActionFilter] = useState<string>('')
  const [entityFilter, setEntityFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs', actionFilter, entityFilter],
    queryFn: () =>
      fetchAuditLogs({
        action: actionFilter || undefined,
        entityType: entityFilter || undefined,
      }),
  })

  const filtered = (logs ?? []).filter(
    (l) =>
      !search ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.entityType ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (l.actorEmail ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search audit logs"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All actions</SelectItem>
            <SelectItem value="listing_approved">listing_approved</SelectItem>
            <SelectItem value="listing_rejected">listing_rejected</SelectItem>
            <SelectItem value="buyer_approve">buyer_approve</SelectItem>
            <SelectItem value="buyer_deny">buyer_deny</SelectItem>
            <SelectItem value="auction_paused">auction_paused</SelectItem>
            <SelectItem value="auction_extended">auction_extended</SelectItem>
            <SelectItem value="dispute_resolved">dispute_resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            <SelectItem value="listing">listing</SelectItem>
            <SelectItem value="buyer">buyer</SelectItem>
            <SelectItem value="auction">auction</SelectItem>
            <SelectItem value="dispute">dispute</SelectItem>
            <SelectItem value="user">user</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Log
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Immutable audit trail. All admin actions are logged.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (filtered ?? []).length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No audit logs found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <th className="pb-3 font-medium">Action</th>
                    <th className="pb-3 font-medium">Entity</th>
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(filtered ?? []).map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-[rgb(var(--border))] hover:bg-secondary/50"
                    >
                      <td className="py-3 font-medium">{log.action}</td>
                      <td className="py-3">
                        {log.entityType}
                        {log.entityId && ` #${String(log.entityId).slice(0, 8)}`}
                      </td>
                      <td className="py-3 text-muted-foreground">{log.actorEmail ?? log.actorId ?? '—'}</td>
                      <td className="py-3 text-muted-foreground">
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
    </div>
  )
}
