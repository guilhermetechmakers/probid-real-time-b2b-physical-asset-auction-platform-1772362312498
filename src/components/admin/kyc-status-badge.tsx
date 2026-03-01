/**
 * KYCStatusBadge - Visual indicator for KYC status.
 * Supports pending, submitted, approved, rejected, needs_action.
 */
import { CheckCircle, XCircle, Clock, AlertCircle, FileQuestion } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UserKycStatus } from '@/types/admin'

interface KYCStatusBadgeProps {
  status: UserKycStatus
  className?: string
  showIcon?: boolean
}

const statusConfig: Record<
  UserKycStatus,
  { variant: 'success' | 'destructive' | 'warning' | 'secondary' | 'default'; label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  approved: { variant: 'success', label: 'Approved', icon: CheckCircle },
  rejected: { variant: 'destructive', label: 'Rejected', icon: XCircle },
  pending: { variant: 'secondary', label: 'Pending', icon: Clock },
  submitted: { variant: 'warning', label: 'Submitted', icon: AlertCircle },
  needs_action: { variant: 'warning', label: 'Needs Action', icon: FileQuestion },
}

export function KYCStatusBadge({ status, className, showIcon = true }: KYCStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={cn('gap-1', className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}
