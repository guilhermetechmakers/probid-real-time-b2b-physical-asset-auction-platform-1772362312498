import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from './dashboard-sidebar'
import { SellerDashboardShell } from '@/components/seller-dashboard/seller-dashboard-shell'
import { useAuth } from '@/contexts/auth-context'

export function DashboardLayout() {
  const { user } = useAuth()
  const role = user?.role === 'seller' ? 'seller' : 'buyer'

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <div className={role === 'seller' ? 'hidden shrink-0 md:block' : 'shrink-0'}>
        <DashboardSidebar role={role} />
      </div>
      {role === 'seller' ? (
        <SellerDashboardShell>
          <Outlet />
        </SellerDashboardShell>
      ) : (
        <main className="flex-1 overflow-auto p-6 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      )}
    </div>
  )
}
