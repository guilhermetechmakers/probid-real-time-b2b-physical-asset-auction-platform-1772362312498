/**
 * ReportsTable - Tabular view for raw event data and computed metrics.
 * Sortable columns, search, export action.
 */
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { AnalyticsEvent } from '@/types/analytics'
import { exportAnalytics } from '@/api/analytics'
import { formatDateTime } from '@/lib/utils'

export interface ReportsTableProps {
  events: AnalyticsEvent[]
  startDate: string
  endDate: string
  className?: string
}

type SortKey = 'timestamp' | 'type' | 'category'

export function ReportsTable({
  events,
  startDate,
  endDate,
  className,
}: ReportsTableProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('timestamp')
  const [sortAsc, setSortAsc] = useState(false)

  const filtered = useMemo(() => {
    const list = Array.isArray(events) ? events : []
    const q = (search ?? '').trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (e) =>
        e.type?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        JSON.stringify(e.payload ?? {}).toLowerCase().includes(q)
    )
  }, [events, search])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortAsc ? cmp : -cmp
    })
    return list
  }, [filtered, sortKey, sortAsc])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const handleExport = async () => {
    try {
      const res = await exportAnalytics({
        format: 'csv',
        startDate,
        endDate,
        filters: {},
      })
      if (res?.url) {
        const a = document.createElement('a')
        a.href = res.url
        a.download = res.fileName ?? 'probid-events.csv'
        a.click()
        toast.success('Export downloaded')
      } else {
        toast.error('Export failed')
      }
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <Card
      className={cn(
        'rounded-xl border border-[rgb(var(--border))] shadow-card overflow-hidden',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Event Log</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search events…"
            value={search ?? ''}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 max-w-xs"
            aria-label="Search events"
          />
        </div>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-[rgb(var(--border))]">
                <th
                  className="cursor-pointer px-4 py-3 text-left font-medium hover:text-foreground"
                  onClick={() => handleSort('timestamp')}
                  aria-sort={sortKey === 'timestamp' ? (sortAsc ? 'ascending' : 'descending') : undefined}
                >
                  Timestamp
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left font-medium hover:text-foreground"
                  onClick={() => handleSort('type')}
                  aria-sort={sortKey === 'type' ? (sortAsc ? 'ascending' : 'descending') : undefined}
                >
                  Type
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left font-medium hover:text-foreground"
                  onClick={() => handleSort('category')}
                  aria-sort={sortKey === 'category' ? (sortAsc ? 'ascending' : 'descending') : undefined}
                >
                  Category
                </th>
                <th className="px-4 py-3 text-left font-medium">Payload</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length > 0 ? (
                sorted.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-[rgb(var(--border))]/50 hover:bg-[rgb(var(--secondary))]/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(e.timestamp)}
                    </td>
                    <td className="px-4 py-3 font-medium">{e.type}</td>
                    <td className="px-4 py-3">{e.category ?? '—'}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">
                      {JSON.stringify(e.payload ?? {})}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No events for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
