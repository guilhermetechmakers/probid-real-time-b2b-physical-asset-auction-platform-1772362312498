/**
 * LiveBidPanel - Real-time bid input with quick-bid increments, live current bid display.
 */
import { useState } from 'react'
import { Gavel } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatCurrency } from '@/lib/utils'
import { getMinBidIncrement } from '@/api/listing-detail'

export interface LiveBidPanelProps {
  currentBid: number
  minIncrement?: number
  onPlaceBid: (amount: number) => void
  isPlacing?: boolean
  className?: string
}

export function LiveBidPanel({
  currentBid,
  minIncrement,
  onPlaceBid,
  isPlacing = false,
  className,
}: LiveBidPanelProps) {
  const minInc = minIncrement ?? getMinBidIncrement()
  const minBid = currentBid + minInc
  const [amountStr, setAmountStr] = useState('')
  const amount = Number(amountStr) || 0
  const isValid = amount >= minBid

  const quickBids = [minInc, minInc * 2, minInc * 5, minInc * 10]

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-xl border-2 border-primary/50 bg-primary/5 p-4">
        <p className="text-xs text-muted-foreground">Current bid</p>
        <p className="text-2xl font-bold text-primary">
          {formatCurrency(currentBid)}
        </p>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Your bid</label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={minBid}
            step={minInc}
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder={formatCurrency(minBid)}
            className="font-mono text-lg"
          />
          <Button
            onClick={() => isValid && onPlaceBid(amount)}
            disabled={!isValid || isPlacing}
            className="shrink-0 hover:shadow-accent-glow"
          >
            <Gavel className="mr-2 h-4 w-4" />
            {isPlacing ? 'Placing…' : 'Bid'}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {quickBids.map((inc) => (
          <Button
            key={inc}
            variant="outline"
            size="sm"
            onClick={() => {
              setAmountStr(String(currentBid + inc))
            }}
          >
            +{formatCurrency(inc)}
          </Button>
        ))}
      </div>
    </div>
  )
}
