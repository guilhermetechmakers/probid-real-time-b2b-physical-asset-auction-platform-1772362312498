import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type KycStatusLike =
  | { status?: string; adminApproved?: boolean }
  | { kycStatus?: string; verificationStatus?: string; adminApproved?: boolean }

function getKycStatusVal(s: KycStatusLike): string | undefined {
  return 'kycStatus' in s ? s.kycStatus : 'status' in s ? s.status : undefined
}

interface KYCBadgeProps {
  status: KycStatusLike
  showLabel?: boolean
  size?: 'sm' | 'default'
  className?: string
}

export function KYCBadge({ status, showLabel = true, size = 'default', className }: KYCBadgeProps) {
  const statusVal = getKycStatusVal(status)
  const verStatus = 'verificationStatus' in status ? status.verificationStatus : undefined
  const isVerified = Boolean(status.adminApproved && (statusVal === 'approved' || verStatus === 'approved'))
  const isPending = statusVal === 'pending' || statusVal === 'submitted' || verStatus === 'submitted'
  const isRejected = statusVal === 'rejected'

  const Icon = isVerified ? ShieldCheck : isRejected ? ShieldAlert : Clock
  const variant = isVerified ? 'success' : isRejected ? 'destructive' : 'warning'
  const label = isVerified
    ? 'Verified'
    : isRejected
      ? 'Rejected'
      : isPending
        ? 'Pending'
        : 'In Review'

  return (
    <Badge
      variant={variant}
      className={cn(
        'inline-flex items-center gap-1.5',
        isVerified && 'bg-[rgb(46,213,115)] text-white',
        size === 'sm' && 'text-xs px-2 py-0',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {showLabel && <span>{label}</span>}
    </Badge>
  )
}
