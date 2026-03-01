/**
 * BanRestrictionToggle - UI control to ban/unban or impose restrictions.
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Ban, ShieldOff, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface BanRestrictionToggleProps {
  userId: string
  isBanned: boolean
  hasRestrictions: boolean
  onBan: (reason: string, endAt?: string) => void | Promise<void>
  onUnban: () => void | Promise<void>
  onAddRestriction: (type: 'bidding' | 'listing' | 'withdrawal' | 'custom', reasons: string[], expiresAt?: string) => void | Promise<void>
  onRemoveRestriction?: (restrictionId: string) => void | Promise<void>
  restrictions?: { id: string; type: string; reasons: string[]; expiresAt?: string; active: boolean }[]
  disabled?: boolean
}

export function BanRestrictionToggle({
  userId: _userId,
  isBanned,
  hasRestrictions,
  onBan,
  onUnban,
  onAddRestriction,
  onRemoveRestriction,
  restrictions = [],
  disabled = false,
}: BanRestrictionToggleProps) {
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [restrictModalOpen, setRestrictModalOpen] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banEndAt, setBanEndAt] = useState('')
  const [restrictType, setRestrictType] = useState<'bidding' | 'listing' | 'withdrawal' | 'custom'>('bidding')
  const [restrictReasons, setRestrictReasons] = useState('')
  const [restrictExpiresAt, setRestrictExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)

  const handleBan = async () => {
    if (!banReason.trim()) return
    setLoading(true)
    try {
      await onBan(banReason.trim(), banEndAt || undefined)
      setBanModalOpen(false)
      setBanReason('')
      setBanEndAt('')
    } finally {
      setLoading(false)
    }
  }

  const handleUnban = async () => {
    setLoading(true)
    try {
      await onUnban()
    } finally {
      setLoading(false)
    }
  }

  const handleAddRestriction = async () => {
    const reasons = restrictReasons.trim() ? restrictReasons.split(',').map((r) => r.trim()).filter(Boolean) : ['Admin imposed']
    setLoading(true)
    try {
      await onAddRestriction(restrictType, reasons, restrictExpiresAt || undefined)
      setRestrictModalOpen(false)
      setRestrictReasons('')
      setRestrictExpiresAt('')
    } finally {
      setLoading(false)
    }
  }

  const activeRestrictions = (restrictions ?? []).filter((r) => r.active)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        {isBanned ? (
          <Button
            variant="outline"
            onClick={handleUnban}
            disabled={disabled || loading}
            className="border-probid-accent/50 bg-probid-accent/10 text-foreground hover:bg-probid-accent/20"
          >
            <ShieldOff className="mr-2 h-4 w-4" />
            Unban User
          </Button>
        ) : (
          <Button
            variant="destructive"
            onClick={() => setBanModalOpen(true)}
            disabled={disabled || loading}
          >
            <Ban className="mr-2 h-4 w-4" />
            Ban User
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => setRestrictModalOpen(true)}
          disabled={disabled || loading}
          className={cn(hasRestrictions && 'border-amber-500/50 bg-amber-500/10')}
        >
          <ShieldAlert className="mr-2 h-4 w-4" />
          {hasRestrictions ? 'Add Restriction' : 'Add Restriction'}
        </Button>
      </div>

      {activeRestrictions.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Active Restrictions</label>
          <ul className="space-y-2">
            {activeRestrictions.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] bg-secondary/50 px-4 py-3"
              >
                <div>
                  <span className="font-medium capitalize">{r.type}</span>
                  {r.reasons?.length > 0 && (
                    <span className="ml-2 text-muted-foreground">— {r.reasons.join(', ')}</span>
                  )}
                  {r.expiresAt && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Expires: {new Date(r.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {onRemoveRestriction && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveRestriction(r.id)}
                    disabled={disabled}
                  >
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={banModalOpen}
        onOpenChange={setBanModalOpen}
        title="Ban User"
        description="Confirm ban. Provide a reason for audit trail."
        confirmLabel="Ban"
        variant="destructive"
        onConfirm={handleBan}
        isLoading={loading}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="ban-reason">Reason *</Label>
            <Textarea
              id="ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Policy violation, fraud, etc."
              rows={3}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="ban-end">End date (optional)</Label>
            <Input
              id="ban-end"
              type="date"
              value={banEndAt}
              onChange={(e) => setBanEndAt(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={restrictModalOpen}
        onOpenChange={setRestrictModalOpen}
        title="Add Restriction"
        description="Impose a temporary restriction on this user."
        confirmLabel="Add"
        variant="default"
        onConfirm={handleAddRestriction}
        isLoading={loading}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="restrict-type">Type</Label>
            <Select value={restrictType} onValueChange={(v) => setRestrictType(v as typeof restrictType)}>
              <SelectTrigger id="restrict-type" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bidding">Bidding</SelectItem>
                <SelectItem value="listing">Listing</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="restrict-reasons">Reasons (comma-separated)</Label>
            <Input
              id="restrict-reasons"
              value={restrictReasons}
              onChange={(e) => setRestrictReasons(e.target.value)}
              placeholder="Suspicious activity, etc."
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="restrict-expires">Expires (optional)</Label>
            <Input
              id="restrict-expires"
              type="date"
              value={restrictExpiresAt}
              onChange={(e) => setRestrictExpiresAt(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  )
}
