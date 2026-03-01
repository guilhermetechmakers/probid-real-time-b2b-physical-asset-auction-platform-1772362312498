/**
 * BulkActionsPanel - Bulk actions for selected users.
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users, Ban, ShieldOff, Mail, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { bulkActionUsers, type BulkActionParams } from '@/api/admin'
import { toast } from 'sonner'

interface BulkActionsPanelProps {
  selectedIds: string[]
  onSuccess?: () => void
  onClearSelection?: () => void
  className?: string
}

const BULK_ACTIONS = [
  { value: 'resend_kyc', label: 'Resend KYC', icon: Mail },
  { value: 'change_subscription', label: 'Change subscription', icon: CreditCard },
  { value: 'ban', label: 'Ban users', icon: Ban },
  { value: 'unban', label: 'Unban users', icon: ShieldOff },
] as const

export function BulkActionsPanel({
  selectedIds,
  onSuccess,
  onClearSelection,
  className,
}: BulkActionsPanelProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [action, setAction] = useState<BulkActionParams['action']>('resend_kyc')
  const [reason, setReason] = useState('')
  const [planId, setPlanId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const count = selectedIds.length
  const isDestructive = action === 'ban'

  const handleOpen = () => {
    setShowDialog(true)
    setReason('')
    setPlanId('')
  }

  const handleConfirm = async () => {
    if (count === 0) return
    if (action === 'change_subscription' && !planId.trim()) {
      toast.error('Plan ID required')
      return
    }
    if (action === 'ban' && !reason.trim()) {
      toast.error('Reason required for ban')
      return
    }

    setIsLoading(true)
    try {
      const params: BulkActionParams = {
        userIds: selectedIds,
        action,
        reason: action === 'ban' ? reason : undefined,
        planId: action === 'change_subscription' ? planId : undefined,
      }
      const res = await bulkActionUsers(params)
      if (res.success) {
        const failed = (res.results ?? []).filter((r) => !r.success).length
        if (failed > 0) {
          toast.warning(`${count - failed} succeeded, ${failed} failed`)
        } else {
          toast.success(`Action applied to ${count} user${count > 1 ? 's' : ''}`)
        }
        setShowDialog(false)
        onSuccess?.()
        onClearSelection?.()
      } else {
        toast.error(res.error ?? 'Action failed')
      }
    } catch {
      toast.error('Action failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (count === 0) return null

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">{count} selected</span>
      <Button size="sm" variant="outline" onClick={handleOpen} aria-label="Bulk actions">
        <Users className="mr-1 h-4 w-4" />
        Bulk Actions
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent showClose={true} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Action</DialogTitle>
            <DialogDescription>
              Apply an action to {count} selected user{count > 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select
                value={action}
                onValueChange={(v) => setAction(v as BulkActionParams['action'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BULK_ACTIONS.map((a) => {
                    const Icon = a.icon
                    return (
                      <SelectItem key={a.value} value={a.value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {a.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {action === 'change_subscription' && (
              <div className="space-y-2">
                <Label htmlFor="bulk-plan">Plan ID</Label>
                <Input
                  id="bulk-plan"
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  placeholder="e.g. premium_monthly"
                />
              </div>
            )}

            {action === 'ban' && (
              <div className="space-y-2">
                <Label htmlFor="bulk-reason">Reason (required)</Label>
                <Input
                  id="bulk-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Policy violation, etc."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={isDestructive ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={
                isLoading ||
                (action === 'change_subscription' && !planId.trim()) ||
                (action === 'ban' && !reason.trim())
              }
            >
              {isLoading ? 'Processing...' : 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
