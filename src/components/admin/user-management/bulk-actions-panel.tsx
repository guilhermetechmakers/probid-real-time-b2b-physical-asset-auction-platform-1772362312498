/**
 * BulkActionsPanel - Bulk actions for selected users.
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { bulkActionUsers } from '@/api/admin'
import { toast } from 'sonner'
import type { AdminUser } from '@/types/admin'

interface BulkActionsPanelProps {
  selectedUsers: AdminUser[]
  onClearSelection: () => void
  onSuccess: () => void
}

export function BulkActionsPanel({
  selectedUsers,
  onClearSelection,
  onSuccess,
}: BulkActionsPanelProps) {
  const [action, setAction] = useState<string>('')
  const [planId, setPlanId] = useState('')
  const [banReason, setBanReason] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const count = (selectedUsers ?? []).length
  const hasSelection = count > 0

  const handleExecute = async () => {
    if (!action || count === 0) return
    setLoading(true)
    try {
      const payload: Record<string, unknown> = {}
      if (action === 'change_plan') payload.planId = planId
      if (action === 'ban') payload.reason = banReason || 'Bulk ban'

      const res = await bulkActionUsers({
        userIds: (selectedUsers ?? []).map((u) => u.id),
        action: action as 'invite' | 'resend_kyc' | 'change_plan' | 'ban' | 'restrict',
        payload: Object.keys(payload).length > 0 ? payload : undefined,
      })

      if (res.success) {
        toast.success(`Bulk action completed for ${count} user(s)`)
        onClearSelection()
        onSuccess()
        setConfirmOpen(false)
        setAction('')
        setPlanId('')
        setBanReason('')
      } else {
        const failed = (res.results ?? []).filter((r) => !r.success).length
        toast.error(failed > 0 ? `${failed} action(s) failed` : (res.error ?? 'Bulk action failed'))
      }
    } catch {
      toast.error('Bulk action failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenConfirm = () => {
    if (action === 'change_plan' && !planId.trim()) {
      toast.error('Plan ID required')
      return
    }
    if (action === 'ban' && !banReason.trim()) {
      toast.error('Ban reason required')
      return
    }
    setConfirmOpen(true)
  }

  const destructiveActions = ['ban']
  const isDestructive = action && destructiveActions.includes(action)

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[rgb(var(--border))] bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">
          {count} selected
        </span>
      </div>

      <Select value={action} onValueChange={setAction} disabled={!hasSelection}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Bulk action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="resend_kyc">Resend KYC</SelectItem>
          <SelectItem value="change_plan">Change Plan</SelectItem>
          <SelectItem value="ban">Ban Users</SelectItem>
        </SelectContent>
      </Select>

      {action === 'change_plan' && (
        <div className="flex items-center gap-2">
          <Label htmlFor="bulk-plan" className="sr-only">Plan ID</Label>
          <Input
            id="bulk-plan"
            placeholder="Plan ID (e.g. premium)"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="w-[160px]"
          />
        </div>
      )}

      {action === 'ban' && (
        <div className="flex items-center gap-2">
          <Label htmlFor="bulk-reason" className="sr-only">Ban reason</Label>
          <Input
            id="bulk-reason"
            placeholder="Reason (required)"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            className="w-[180px]"
          />
        </div>
      )}

      <Button
        onClick={handleOpenConfirm}
        disabled={!hasSelection || !action || loading}
        variant={isDestructive ? 'destructive' : 'default'}
        className="bg-probid-accent text-probid-charcoal hover:bg-probid-accent/90"
      >
        Apply
      </Button>

      {hasSelection && (
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear
        </Button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isDestructive ? 'Confirm destructive action' : 'Confirm bulk action'}
        description={
          isDestructive
            ? `This will ban ${count} user(s). This action can be reversed.`
            : `Apply "${action.replace(/_/g, ' ')}" to ${count} user(s)?`
        }
        confirmLabel="Confirm"
        variant={isDestructive ? 'destructive' : 'default'}
        onConfirm={handleExecute}
        isLoading={loading}
      />
    </div>
  )
}
