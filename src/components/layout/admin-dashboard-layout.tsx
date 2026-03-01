/**
 * AdminDashboardLayout - Admin shell with left nav and persistent bottom nav.
 * Per design: high-contrast, neon yellow-green CTAs, dark charcoal nav.
 */
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Gavel,
  DollarSign,
  AlertCircle,
  Shield,
  FileText,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/dashboard/ops', label: 'Ops Queue', icon: ClipboardCheck },
  { href: '/admin/dashboard/buyers', label: 'Buyers', icon: Users },
  { href: '/admin/dashboard/auctions', label: 'Auctions', icon: Gavel },
  { href: '/admin/dashboard/finance', label: 'Finance', icon: DollarSign },
  { href: '/admin/dashboard/disputes', label: 'Disputes', icon: AlertCircle },
  { href: '/admin/dashboard/rbac', label: 'RBAC', icon: Shield },
  { href: '/admin/dashboard/audit-logs', label: 'Audit Logs', icon: FileText },
]

export function AdminDashboardLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-1">
        {/* Left sidebar - desktop */}
        <aside className="hidden w-56 shrink-0 border-r border-[rgb(var(--border))] bg-card md:block">
          <div className="sticky top-16 flex flex-col gap-1 p-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </p>
            {(ADMIN_NAV_ITEMS ?? []).map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-accent-glow'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 overflow-auto p-6 md:p-8 pb-24 md:pb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {user?.email ?? 'Operations console'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          <Outlet />
        </main>
      </div>

      {/* Bottom nav - mobile: pill-shaped, dark charcoal, neon active */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around rounded-t-2xl border-t border-[rgb(var(--border))] bg-[#161616] px-2 py-2 shadow-[0_-4px_20px_rgba(22,22,22,0.15)] md:hidden">
        {(ADMIN_NAV_ITEMS ?? []).slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 min-w-[44px] min-h-[44px] justify-center transition-colors"
              aria-label={item.label}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-[#EFFD2D]' : 'text-white/70'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium',
                  isActive ? 'text-[#EFFD2D]' : 'text-white/70'
                )}
              >
                {item.label.length > 8 ? item.label.slice(0, 7) + '…' : item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
