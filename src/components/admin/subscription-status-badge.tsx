/**
 * SubscriptionStatusBadge - Visual indicator for subscription status.
 * Supports active, past_due, cancelled, inactive, none.
 */
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SubscriptionPlanStatus } from '@/types/admin'

interface SubscriptionStatusBadgeProps {
  status: SubscriptionPlanStatus
  plan?: string
  className?: string
}

const statusConfig: Record<SubscriptionPlanStatus, { variant: 'success' | 'destructive' | 'warning' | 'secondary' | 'default'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  past_due: { variant: 'warning', label: 'Past Due' },
  cancelled: { variant: 'destructive', label: 'Cancelled' },
  inactive: { variant: 'secondary', label: 'Inactive' },
  none: { variant: 'secondary', label: 'None' },
}

export function SubscriptionStatusBadge({ status, plan, className }: SubscriptionStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.none

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
      {plan && <span className="ml-1 opacity-90">({plan})</span>}
    </Badge>
  )
}
