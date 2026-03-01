/**
 * DataVisualizationRow - Minimalist horizontal bars for status indicators.
 * Uses neon yellow-green fill for active/paid portions.
 */
import { DataVisualBar } from '@/components/shared/data-visual-bar'
import { cn } from '@/lib/utils'

export interface DataVisualizationRowProps {
  paidAmount: number
  totalAmount: number
  label?: string
  className?: string
}

export function DataVisualizationRow({
  paidAmount,
  totalAmount,
  label = 'Payment progress',
  className,
}: DataVisualizationRowProps) {
  const safePaid = typeof paidAmount === 'number' && paidAmount >= 0 ? paidAmount : 0
  const safeTotal = typeof totalAmount === 'number' && totalAmount > 0 ? totalAmount : 1
  const value = Math.min(safePaid, safeTotal)

  return (
    <div className={cn('w-full', className)}>
      <DataVisualBar
        value={value}
        max={safeTotal}
        label={label}
        showActive={true}
        className="[&_.bg-primary]:bg-primary"
      />
    </div>
  )
}
