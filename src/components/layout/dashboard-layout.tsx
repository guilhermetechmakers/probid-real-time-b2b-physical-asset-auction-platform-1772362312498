import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from './dashboard-sidebar'
import { useAuth } from '@/contexts/auth-context'

export function DashboardLayout() {
  const { user } = useAuth()
  const role = user?.role === 'seller' ? 'seller' : 'buyer'

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar role={role} />
      <main className="flex-1 overflow-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
