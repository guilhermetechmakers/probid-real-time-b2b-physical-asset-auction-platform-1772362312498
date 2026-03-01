import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Calendar,
  Heart,
  Gavel,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const sellerNavItems: NavItem[] = [
  { href: '/dashboard/seller', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/seller/listings', label: 'Listings', icon: Package },
  { href: '/dashboard/seller/create', label: 'Create Listing', icon: PlusCircle },
  { href: '/dashboard/seller/auctions', label: 'Auctions', icon: Gavel },
]

const buyerNavItems: NavItem[] = [
  { href: '/dashboard/buyer', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/buyer/auctions', label: 'Auctions', icon: Calendar },
  { href: '/dashboard/buyer/watchlist', label: 'Watchlist', icon: Heart },
]

export function DashboardSidebar({ role }: { role: 'seller' | 'buyer' }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const items = role === 'seller' ? sellerNavItems : buyerNavItems

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-[rgb(var(--border))] bg-card transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-[rgb(var(--border))] px-4">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold">ProBid</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <Link key={item.href} to={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </div>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-[rgb(var(--border))] p-2">
        <Link to="/settings">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </div>
        </Link>
      </div>
    </aside>
  )
}
