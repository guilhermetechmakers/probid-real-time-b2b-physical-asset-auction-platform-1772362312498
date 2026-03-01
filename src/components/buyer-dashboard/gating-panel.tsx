import { Link } from 'react-router-dom'
import { ShieldCheck, CreditCard, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KYCBadge } from './kyc-badge'
import type { KycVerificationStatus } from '@/types'
import type { Subscription } from '@/types'
import { cn } from '@/lib/utils'

interface GatingPanelProps {
  verificationStatus?: KycVerificationStatus
  subscription?: Subscription | null
  needsSubscription?: boolean
  needsKyc?: boolean
  className?: string
}

export function GatingPanel({
  verificationStatus,
  subscription,
  needsSubscription: needsSubProp,
  needsKyc: needsKycProp,
  className,
}: GatingPanelProps) {
  const hasSubscription = subscription?.status === 'active'
  const isVerified = verificationStatus
    ? verificationStatus.adminApproved && verificationStatus.status === 'approved'
    : false
  const needsKyc = needsKycProp ?? !isVerified
  const needsSubscription = needsSubProp ?? !hasSubscription

  if (!needsKyc && !needsSubscription) return null

  const status = verificationStatus ?? {
    status: 'pending' as const,
    adminApproved: false,
  }

  return (
    <Card className={cn('border-probid-accent/30 bg-probid-soft-yellow/10', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Complete Setup to Access Dashboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Verify your identity and subscribe to unlock auctions and bidding
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-card px-4 py-3">
            <KYCBadge status={status} />
            <span className="text-sm">
              {needsKyc ? 'KYC verification required' : 'Identity verified'}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-card px-4 py-3">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm">
              {needsSubscription ? 'Subscription required' : 'Active subscription'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {needsKyc && (
            <Button asChild>
              <Link to="/settings#verification">
                Start Verification
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
          {needsSubscription && (
            <Button asChild variant={needsKyc ? 'outline' : 'default'}>
              <Link to="/pricing">
                View Plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
