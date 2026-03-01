/**
 * BanRestrictionToggle - UI control to ban/unban or impose restrictions.
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Ban, ShieldOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BanRestrictionToggleProps {
  isBanned: boolean
  onBan: (reason: string, endAt?: string) => void | Promise<void>
  onUnban: () => void | Promise<void>
  isLoading?: boolean
  className?: string
}

export function BanRestrictionToggle({
  isBanned,
  onBan,
  onUnban,
  isLoading = false,
  className,
}: BanRestrictionToggleProps) {
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [reason, setReason] = useState('')
  const [endAt, setEndAt] = useState('')

  const handleBan = async () => {
    await onBan(reason, endAt || undefined)
    setShowBanDialog(false)
    setReason('')
    setEndAt('')
  }

  const handleUnban = async () => {
    await onUnban()
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isBanned ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnban}
          disabled={isLoading}
          className="border-[rgb(var(--success))] text-[rgb(var(--success))] hover:bg-[rgb(var(--success))]/10"
          aria-label="Unban user"
        >
          <ShieldOff className="mr-1 h-4 w-4" />
          Unban
        </Button>
      ) : (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowBanDialog(true)}
          disabled={isLoading}
          aria-label="Ban user"
        >
          <Ban className="mr-1 h-4 w-4" />
          Ban
        </Button>
      )}

      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent showClose={true} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Provide a reason for the ban. This action will be logged for audit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason (required)</Label>
              <Input
                id="ban-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Policy violation, fraud, etc."
                aria-required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ban-end">End date (optional)</Label>
              <Input
                id="ban-end"
                type="date"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={!reason.trim() || isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm Ban'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
