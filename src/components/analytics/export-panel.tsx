/**
 * ExportPanel - Export to CSV/Excel, schedule report email.
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { exportAnalytics, scheduleExportReport } from '@/api/analytics'
import type { FilterBarFilters } from './filter-bar'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface ExportPanelProps {
  filters: FilterBarFilters
  hasData: boolean
  className?: string
}

export function ExportPanel({ filters, hasData, className }: ExportPanelProps) {
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv')
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [email, setEmail] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [isExporting, setIsExporting] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)

  const handleExport = async () => {
    if (!hasData) {
      toast.error('No data to export. Adjust filters or wait for data.')
      return
    }
    setIsExporting(true)
    try {
      const res = await exportAnalytics({
        format,
        startDate: filters.startDate ?? '',
        endDate: filters.endDate ?? '',
        filters: {},
      })
      if (res?.url) {
        const a = document.createElement('a')
        a.href = res.url
        a.download = res.fileName ?? `probid-analytics.${format}`
        a.click()
        toast.success('Export downloaded')
      } else {
        toast.error('Export failed')
      }
    } catch {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleSchedule = async () => {
    if (!scheduleEnabled) return
    const trimmed = (email ?? '').trim()
    if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
      toast.error('Enter a valid email address')
      return
    }
    setIsScheduling(true)
    try {
      const res = await scheduleExportReport({
        email: trimmed,
        frequency,
        params: { startDate: filters.startDate, endDate: filters.endDate },
      })
      if (res.success) {
        toast.success('Report schedule saved')
      } else {
        toast.error('Failed to schedule report')
      }
    } catch {
      toast.error('Failed to schedule report')
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <Card
      className={cn(
        'rounded-xl border border-[rgb(var(--border))] shadow-card',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Download className="h-4 w-4" />
          Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as 'csv' | 'xlsx')}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleExport}
          disabled={!hasData || isExporting}
          className="w-full bg-primary text-primary-foreground"
          aria-label={hasData ? 'Export analytics data' : 'No data to export'}
        >
          {isExporting ? 'Exporting…' : 'Export'}
        </Button>
        {!hasData && (
          <p className="text-xs text-muted-foreground" role="status">
            No data selected. Adjust filters to export.
          </p>
        )}

        <div className="border-t border-[rgb(var(--border))] pt-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="schedule-report"
              checked={scheduleEnabled}
              onCheckedChange={(c) => setScheduleEnabled(Boolean(c))}
              aria-label="Schedule report email"
            />
            <Label htmlFor="schedule-report" className="text-sm font-medium">
              Schedule report email
            </Label>
          </div>
          {scheduleEnabled && (
            <div className="mt-3 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="schedule-email" className="text-xs font-medium text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="schedule-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email ?? ''}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  aria-label="Email for scheduled reports"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as 'daily' | 'weekly' | 'monthly')}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={handleSchedule}
                disabled={isScheduling}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                {isScheduling ? 'Saving…' : 'Save schedule'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
