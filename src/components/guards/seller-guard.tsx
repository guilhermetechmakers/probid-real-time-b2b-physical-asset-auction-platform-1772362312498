/**
 * SellerGuard - RBAC guard for seller-only routes.
 * Redirects non-sellers to buyer dashboard.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'

interface SellerGuardProps {
  children: React.ReactNode
}

export function SellerGuard({ children }: SellerGuardProps) {
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

  if (user.role !== 'seller') {
    return <Navigate to="/dashboard/buyer" replace />
  }

  return <>{children}</>
}
