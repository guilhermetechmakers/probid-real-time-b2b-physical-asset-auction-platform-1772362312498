/**
 * AdminGuard - RBAC guard for admin/ops-only routes.
 * Redirects non-admin users to dashboard or home.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
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

  const isAdmin = user.role === 'admin' || user.role === 'ops'
  if (!isAdmin) {
    return <Navigate to={user.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'} replace />
  }

  return <>{children}</>
}
