/**
 * AdminDashboardShell - Layout with top header and persistent bottom nav.
 * Design: pill-shaped bottom bar, neon accent for active, dark charcoal bg.
 */
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  UserCog,
  Gavel,
  DollarSign,
  AlertTriangle,
  Shield,
  FileText,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/dashboard/ops', label: 'Ops Queue', icon: ClipboardCheck },
  { href: '/admin/dashboard/buyers', label: 'Buyers', icon: Users },
  { href: '/admin/dashboard/users', label: 'Users', icon: UserCog },
  { href: '/admin/dashboard/auctions', label: 'Auctions', icon: Gavel },
  { href: '/admin/dashboard/finance', label: 'Finance', icon: DollarSign },
  { href: '/admin/dashboard/disputes', label: 'Disputes', icon: AlertTriangle },
  { href: '/admin/dashboard/rbac', label: 'RBAC', icon: Shield },
  { href: '/admin/dashboard/audit-logs', label: 'Audit Logs', icon: FileText },
  { href: '/admin/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
]

interface AdminDashboardShellProps {
  children: React.ReactNode
}

export function AdminDashboardShell({ children }: AdminDashboardShellProps) {
  const location = useLocation()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col pb-20 md:pb-8">
      {/* Top header */}
      <header className="sticky top-0 z-10 border-b border-[rgb(var(--border))] bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Admin Dashboard</h2>
          <Link
            to="/dashboard/seller"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to App
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>

      {/* Bottom navigation - mobile & desktop persistent */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-start overflow-x-auto rounded-t-2xl border-t border-[rgb(var(--border))] bg-probid-charcoal px-2 py-2 shadow-[0_-4px_20px_rgba(22,22,22,0.15)]"
        aria-label="Admin navigation"
      >
        <div className="flex min-w-max items-center gap-1">
          {(adminNavItems ?? []).map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex min-h-[44px] min-w-[44px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 transition-colors',
                  isActive ? 'bg-[rgba(239,253,45,0.15)] text-probid-accent' : 'text-white/70 hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">
                  {item.label.length > 10 ? item.label.slice(0, 8) + '…' : item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
