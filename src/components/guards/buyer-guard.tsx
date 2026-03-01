/**
 * BuyerGuard - Gates buyer dashboard behind auth, subscription, and KYC.
 * Shows upgrade/verify prompts when not authorized.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'

interface BuyerGuardProps {
  children: React.ReactNode
  /** When true, only blocks if not subscribed or KYC not verified. When false, allows access but shows gating UI. */
  strict?: boolean
}

export function BuyerGuard({ children, strict = false }: BuyerGuardProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary/30" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  if (user.role !== 'buyer' && user.role !== 'admin') {
    return <Navigate to="/dashboard/seller" replace />
  }

  const hasActiveSubscription = user.subscriptionStatus === 'active'
  const isKycVerified = user.kycStatus === 'approved'

  if (strict && (!hasActiveSubscription || !isKycVerified)) {
    return <Navigate to="/auth" state={{ from: location, requireUpgrade: true }} replace />
  }

  return <>{children}</>
}
