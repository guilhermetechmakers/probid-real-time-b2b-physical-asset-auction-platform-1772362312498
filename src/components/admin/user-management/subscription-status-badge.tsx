/**
 * SubscriptionStatusBadge - Visual indicator for subscription status.
 */
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SubscriptionPlanStatus } from '@/types/admin'

interface SubscriptionStatusBadgeProps {
  status: SubscriptionPlanStatus | string
  plan?: string
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<string, { variant: 'success' | 'destructive' | 'warning' | 'secondary' | 'default'; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  active: { variant: 'success', icon: CheckCircle, label: 'Active' },
  past_due: { variant: 'destructive', icon: AlertTriangle, label: 'Past Due' },
  cancelled: { variant: 'destructive', icon: XCircle, label: 'Cancelled' },
  inactive: { variant: 'secondary', icon: XCircle, label: 'Inactive' },
  none: { variant: 'secondary', icon: CreditCard, label: 'None' },
}

export function SubscriptionStatusBadge({ status, plan, showIcon = true, className }: SubscriptionStatusBadgeProps) {
  const normalized = (status ?? 'none').toLowerCase()
  const config = statusConfig[normalized] ?? statusConfig.none
  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" aria-hidden />}
      {plan ? `${config.label} (${plan})` : config.label}
    </Badge>
  )
}
