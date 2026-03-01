/**
 * BidWidget - Bid input, proxy option, confirm modal, validation, outbid threshold hints.
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
import { cn, formatCurrency } from '@/lib/utils'
import { getMinBidIncrement } from '@/api/listing-detail'

export interface BidWidgetProps {
  listingId: string
  currentBid?: number
  reservePrice?: number
  minIncrement?: number
  isLive?: boolean
  isEnded?: boolean
  onPlaceBid: (amount: number, isProxy?: boolean, proxyMax?: number) => void
  isPlacing?: boolean
  isAuthenticated?: boolean
  className?: string
}

export function BidWidget({
  listingId: _listingId,
  currentBid = 0,
  reservePrice: _reservePrice,
  minIncrement,
  isLive,
  isEnded,
  onPlaceBid,
  isPlacing = false,
  isAuthenticated = false,
  className,
}: BidWidgetProps) {
  const minInc = minIncrement ?? getMinBidIncrement(currentBid)
  const minBid = currentBid + minInc
  const [amountStr, setAmountStr] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [isProxy, setIsProxy] = useState(false)
  const [proxyMaxStr, setProxyMaxStr] = useState('')

  const amount = Number(amountStr) || 0
  const proxyMax = Number(proxyMaxStr) || 0
  const isValid = amount >= minBid

  const handleSubmit = () => {
    if (!isValid || isPlacing) return
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    if (!isValid) return
    onPlaceBid(amount, isProxy, isProxy ? proxyMax : undefined)
    setShowConfirm(false)
    setAmountStr('')
    setProxyMaxStr('')
    setIsProxy(false)
  }

  const handleQuickBid = (inc: number) => {
    const next = currentBid + inc
    setAmountStr(String(next))
  }

  const quickIncrements = [minInc, minInc * 2, minInc * 5, minInc * 10]

  return (
    <div className={cn('space-y-4', className)}>
      {!isAuthenticated ? (
        <p className="text-sm text-muted-foreground">
          Sign in to place your bid.
        </p>
      ) : isEnded ? (
        <p className="text-sm text-muted-foreground">
          This auction has ended.
        </p>
      ) : !isLive ? (
        <p className="text-sm text-muted-foreground">
          Bidding will open when the auction goes live.
        </p>
      ) : (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium">Your bid</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={minBid}
                step={minInc}
                placeholder={formatCurrency(minBid)}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="font-mono"
              />
              <Button
                onClick={handleSubmit}
                disabled={!isValid || isPlacing}
                className="shrink-0 hover:shadow-accent-glow"
              >
                {isPlacing ? 'Placing…' : 'Bid'}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Minimum: {formatCurrency(minBid)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickIncrements.map((inc) => (
              <Button
                key={inc}
                variant="outline"
                size="sm"
                onClick={() => handleQuickBid(inc)}
              >
                +{formatCurrency(inc)}
              </Button>
            ))}
          </div>
        </>
      )}

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm bid</DialogTitle>
            <DialogDescription>
              You are about to place a bid of {formatCurrency(amount)}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="proxy"
                checked={isProxy}
                onChange={(e) => setIsProxy(e.target.checked)}
              />
              <label htmlFor="proxy" className="text-sm">
                Set as proxy bid (max amount)
              </label>
            </div>
            {isProxy && (
              <div>
                <label className="mb-1 block text-sm">Max proxy amount</label>
                <Input
                  type="number"
                  min={amount}
                  value={proxyMaxStr}
                  onChange={(e) => setProxyMaxStr(e.target.value)}
                  placeholder={formatCurrency(amount)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValid || isPlacing}
              className="hover:shadow-accent-glow"
            >
              {isPlacing ? 'Placing…' : 'Confirm bid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
