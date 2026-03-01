/**
 * QuickBidPanel - Preset increments (+1%, +5%, +10%), custom bid input, proxy bid toggle.
 */
import { useState } from 'react'
import { Gavel, Zap, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn, formatCurrency } from '@/lib/utils'
import { getMinBidIncrement } from '@/api/listing-detail'

const PRESET_PERCENTS = [1, 5, 10] as const

export interface QuickBidPanelProps {
  currentBid: number
  minIncrement?: number
  reservePrice?: number
  maxProxy?: number
  onPlaceBid: (amount: number) => void
  onPlaceProxyBid?: (maxAmount: number) => void
  isPlacing?: boolean
  isAuthenticated?: boolean
  className?: string
}

export function QuickBidPanel({
  currentBid,
  minIncrement,
  reservePrice = 0,
  maxProxy,
  onPlaceBid,
  onPlaceProxyBid,
  isPlacing = false,
  isAuthenticated = true,
  className,
}: QuickBidPanelProps) {
  const minInc = minIncrement ?? getMinBidIncrement(currentBid)
  const minBid = currentBid + minInc
  const [amountStr, setAmountStr] = useState('')
  const [proxyEnabled, setProxyEnabled] = useState(false)
  const [proxyMaxStr, setProxyMaxStr] = useState('')

  const amount = Number(amountStr) || 0
  const proxyMax = Number(proxyMaxStr) || 0
  const isValidBid = amount >= minBid
  const isValidProxy =
    proxyEnabled && proxyMax >= minBid && (maxProxy == null || proxyMax <= maxProxy)

  const presetAmounts = PRESET_PERCENTS.map((p) =>
    Math.max(minBid, currentBid + Math.ceil(currentBid * (p / 100)))
  )

  const handlePlaceBid = () => {
    if (proxyEnabled && onPlaceProxyBid && isValidProxy) {
      onPlaceProxyBid(proxyMax)
    } else if (isValidBid) {
      onPlaceBid(amount)
    }
  }

  const canSubmit = proxyEnabled ? isValidProxy : isValidBid

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-xl border-2 border-primary/50 bg-primary/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Current bid
        </p>
        <p className="text-2xl font-bold text-primary">
          {formatCurrency(currentBid)}
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Your bid</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={minBid}
            step={minInc}
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder={formatCurrency(minBid)}
            className="font-mono text-lg"
            disabled={proxyEnabled}
          />
          <Button
            onClick={handlePlaceBid}
            disabled={!canSubmit || isPlacing || !isAuthenticated}
            className="shrink-0 font-bold uppercase hover:shadow-accent-glow"
          >
            <Gavel className="mr-2 h-4 w-4" />
            {isPlacing ? 'Placing…' : proxyEnabled ? 'Proxy bid' : 'Place bid'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {presetAmounts.map((amt) => (
          <Button
            key={amt}
            variant="outline"
            size="sm"
            onClick={() => {
              setProxyEnabled(false)
              setAmountStr(String(amt))
            }}
            disabled={proxyEnabled}
            className="font-medium"
          >
            +{formatCurrency(amt - currentBid)}
          </Button>
        ))}
      </div>

      {onPlaceProxyBid && isAuthenticated && (
        <div className="space-y-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">Proxy bid</Label>
              <span
                title="Set your maximum. We'll bid automatically up to this amount when you're outbid."
                className="cursor-help"
              >
                <Info className="h-4 w-4 text-muted-foreground" />
              </span>
            </div>
            <Button
              variant={proxyEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setProxyEnabled(!proxyEnabled)}
            >
              {proxyEnabled ? 'On' : 'Off'}
            </Button>
          </div>
          {proxyEnabled && (
            <div className="space-y-2">
              <Input
                type="number"
                min={minBid}
                step={minInc}
                value={proxyMaxStr}
                onChange={(e) => setProxyMaxStr(e.target.value)}
                placeholder={formatCurrency(minBid)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Min: {formatCurrency(minBid)}
                {reservePrice > 0 && ` • Reserve: ${formatCurrency(reservePrice)}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
