/**
 * ActionsBar - Resubmit, Schedule Auction, Archive CTAs with confirmations.
 */

import { useState } from 'react'
import { Send, Calendar, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
export interface ActionsBarProps {
  onResubmit?: () => void
  onScheduleAuction?: (window: { start: string; end: string }) => void
  onArchive?: () => void
  isBusy?: boolean
  canResubmit?: boolean
  canSchedule?: boolean
  canArchive?: boolean
}

export function ActionsBar({
  onResubmit,
  onScheduleAuction,
  onArchive,
  isBusy = false,
  canResubmit = true,
  canSchedule = true,
  canArchive = true,
}: ActionsBarProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const handleScheduleSubmit = () => {
    if (start && end && onScheduleAuction) {
      onScheduleAuction({ start, end })
      setScheduleOpen(false)
      setStart('')
      setEnd('')
    }
  }

  const handleArchiveConfirm = () => {
    onArchive?.()
    setArchiveOpen(false)
  }

  return (
    <div className="flex flex-wrap gap-4">
      {canResubmit && onResubmit && (
        <Button
          onClick={onResubmit}
          disabled={isBusy}
          className="gap-2 hover:scale-[1.02] hover:shadow-accent-glow transition-all duration-200"
        >
          <Send className="h-4 w-4" />
          {isBusy ? 'Submitting…' : 'Resubmit for Review'}
        </Button>
      )}
      {canSchedule && onScheduleAuction && (
        <>
          <Button
            variant="outline"
            onClick={() => setScheduleOpen(true)}
            disabled={isBusy}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule Auction
          </Button>
          <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Auction</DialogTitle>
                <DialogDescription>
                  Set the auction window start and end times.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Start</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setScheduleOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleSubmit}
                  disabled={!start || !end || isBusy}
                >
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
      {canArchive && onArchive && (
        <>
          <Button
            variant="outline"
            onClick={() => setArchiveOpen(true)}
            disabled={isBusy}
            className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Archive className="h-4 w-4" />
            Archive Listing
          </Button>
          <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Archive Listing</DialogTitle>
                <DialogDescription>
                  This will archive the listing. You can restore it later if needed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setArchiveOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleArchiveConfirm}
                  disabled={isBusy}
                >
                  Archive
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
