/**
 * ProxyBidPanel - Schedule and manage proxy bid max amount with validation and auto-confirm.
 */
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gavel, Zap } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { getMinBidIncrement } from '@/api/listing-detail'

export interface ProxyBidPanelProps {
  currentBid: number
  minIncrement?: number
  reservePrice?: number
  onSetProxyBid: (maxAmount: number) => void
  isSetting?: boolean
  isAuthenticated?: boolean
  className?: string
}

export function ProxyBidPanel({
  currentBid,
  minIncrement,
  reservePrice = 0,
  onSetProxyBid,
  isSetting = false,
  isAuthenticated = false,
  className,
}: ProxyBidPanelProps) {
  const minInc = minIncrement ?? getMinBidIncrement(currentBid)
  const minBid = currentBid + minInc
  const [open, setOpen] = useState(false)
  const [maxAmountStr, setMaxAmountStr] = useState('')
  const maxAmount = Number(maxAmountStr) || 0
  const isValid = maxAmount >= minBid

  const handleConfirm = () => {
    if (!isValid || isSetting) return
    onSetProxyBid(maxAmount)
    setOpen(false)
    setMaxAmountStr('')
  }

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to set a proxy bid.
      </p>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Button
        variant="outline"
        size="lg"
        className="w-full hover:shadow-accent-glow"
        onClick={() => setOpen(true)}
      >
        <Zap className="mr-2 h-4 w-4" />
        Set Proxy Bid
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Proxy Bid
            </DialogTitle>
            <DialogDescription>
              Set your maximum bid amount. The system will automatically bid on your behalf up to this limit when you are outbid.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 p-4">
              <p className="text-xs text-muted-foreground">Current bid</p>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(currentBid)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proxy-max">Maximum bid amount</Label>
              <Input
                id="proxy-max"
                type="number"
                min={minBid}
                step={minInc}
                value={maxAmountStr}
                onChange={(e) => setMaxAmountStr(e.target.value)}
                placeholder={formatCurrency(minBid)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Minimum: {formatCurrency(minBid)}
                {reservePrice > 0 && (
                  <span> • Reserve: {formatCurrency(reservePrice)}</span>
                )}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValid || isSetting}
              className="hover:shadow-accent-glow"
            >
              {isSetting ? 'Setting…' : 'Confirm Proxy Bid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
