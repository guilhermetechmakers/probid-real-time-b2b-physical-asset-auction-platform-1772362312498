import { ShieldCheck, ShieldAlert, FileCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KYCBadge } from './kyc-badge'
import type { KycVerificationStatus } from '@/types'
import { cn } from '@/lib/utils'

interface KYCVerificationPanelProps {
  status: KycVerificationStatus
  isLoading?: boolean
  className?: string
}

export function KYCVerificationPanel({
  status,
  isLoading,
  className,
}: KYCVerificationPanelProps) {
  const isVerified = status.adminApproved && status.status === 'approved'
  const requiredActions = Array.isArray(status.requiredActions) ? status.requiredActions : []

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="h-5 w-32 rounded bg-[rgb(var(--muted))]" />
        </CardHeader>
        <CardContent>
          <div className="h-16 rounded-lg bg-[rgb(var(--muted))]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {isVerified ? (
            <ShieldCheck className="h-5 w-5 text-success" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-probid-accent" />
          )}
          KYC Verification
        </CardTitle>
        <KYCBadge status={status} />
      </CardHeader>
      <CardContent>
        {isVerified ? (
          <p className="text-sm text-muted-foreground">
            Your identity has been verified. You have full access to the platform.
          </p>
        ) : (
          <div className="space-y-3">
            {requiredActions.length > 0 && (
              <ul className="space-y-1.5 text-sm">
                {requiredActions.map((action, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                    {action}
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="default" className="w-full">
              <a href="/settings#verification">
                {status.status === 'pending' ? 'Start Verification' : 'View Status'}
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
