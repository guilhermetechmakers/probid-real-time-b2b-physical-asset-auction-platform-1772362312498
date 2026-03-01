/**
 * DepositHoldPanel - Shows deposit/hold status, capture/release actions.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Lock, Unlock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DepositStatus } from '@/types/checkout'

export interface DepositHoldPanelProps {
  amount: number
  status: DepositStatus
  holdUntil?: string | null
  capturedAt?: string | null
  currency?: string
  onCapture?: () => void
  isCapturing?: boolean
  className?: string
}

export function DepositHoldPanel({
  amount,
  status,
  holdUntil,
  capturedAt,
  currency = 'USD',
  onCapture,
  isCapturing = false,
  className,
}: DepositHoldPanelProps) {
  const isHeld = status === 'HELD'
  const isCaptured = status === 'CAPTURED'
  const isReleased = status === 'RELEASED'

  return (
    <Card
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-card shadow-card transition-all duration-300',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-bold uppercase tracking-wide">
          {isHeld ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Unlock className="h-4 w-4 text-success" />
          )}
          Deposit / Hold
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-semibold">{formatCurrency(amount, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span
            className={cn(
              'font-medium',
              isHeld && 'text-muted-foreground',
              isCaptured && 'text-success',
              isReleased && 'text-muted-foreground'
            )}
          >
            {status}
          </span>
        </div>
        {holdUntil != null && holdUntil !== '' && isHeld && (
          <p className="text-xs text-muted-foreground">
            Hold until: {formatDate(holdUntil)}
          </p>
        )}
        {capturedAt != null && capturedAt !== '' && isCaptured && (
          <p className="text-xs text-success">Captured {formatDate(capturedAt)}</p>
        )}
        {isHeld && onCapture != null && (
          <Button
            onClick={onCapture}
            disabled={isCapturing}
            className="w-full uppercase"
          >
            {isCapturing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Capture Deposit
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
