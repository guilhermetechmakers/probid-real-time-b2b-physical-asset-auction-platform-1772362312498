/**
 * KYCStatusBadge - Visual indicator for KYC status with optional icon.
 */
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, AlertCircle, FileQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserKycStatus } from '@/types/admin'

interface KYCStatusBadgeProps {
  status: UserKycStatus | string
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<string, { variant: 'success' | 'destructive' | 'warning' | 'secondary' | 'default'; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  approved: { variant: 'success', icon: CheckCircle, label: 'Approved' },
  rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
  pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
  submitted: { variant: 'warning', icon: AlertCircle, label: 'Submitted' },
  needs_action: { variant: 'warning', icon: AlertCircle, label: 'Needs Action' },
  none: { variant: 'secondary', icon: FileQuestion, label: 'N/A' },
}

export function KYCStatusBadge({ status, showIcon = true, className }: KYCStatusBadgeProps) {
  const normalized = (status ?? 'pending').toLowerCase()
  const config = statusConfig[normalized] ?? statusConfig.pending
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
      {config.label}
    </Badge>
  )
}
