/**
 * SellerDashboardShell - Layout with sidebar, top action bar, and mobile bottom nav.
 * Desktop: left sidebar + main content with top bar.
 * Mobile: bottom tab bar + main content.
 */

import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Gavel,
  ClipboardCheck,
  TrendingUp,
  HelpCircle,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const sellerNavItems = [
  { href: '/dashboard/seller', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/seller/listings', label: 'Listings', icon: Package },
  { href: '/dashboard/seller/create', label: 'Create', icon: PlusCircle },
  { href: '/dashboard/seller/auctions', label: 'Auctions', icon: Gavel },
  { href: '/dashboard/seller/inspections', label: 'Inspections', icon: ClipboardCheck },
  { href: '/dashboard/seller/sales', label: 'Sales', icon: TrendingUp },
  { href: '/dashboard/seller/support', label: 'Support', icon: HelpCircle },
]

interface SellerDashboardShellProps {
  children: React.ReactNode
}

export function SellerDashboardShell({ children }: SellerDashboardShellProps) {
  const location = useLocation()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* Main content area */}
      <div className="flex flex-1 flex-col pb-20 md:pb-0">
        {/* Top action bar - desktop */}
        <header className="sticky top-0 z-10 hidden border-b border-[rgb(var(--border))] bg-card px-4 py-3 md:flex md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Seller Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild aria-label="Notifications">
              <Link to="/dashboard/seller/notifications">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/seller/create">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Listing
              </Link>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[rgb(var(--border))] bg-[#161616] py-2 md:hidden"
        aria-label="Seller navigation"
      >
        {sellerNavItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/dashboard/seller' &&
              location.pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-[#EFFD2D]' : 'text-white/70 hover:text-white'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
