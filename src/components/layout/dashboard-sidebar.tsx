import { useState, useEffect } from 'react'
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
  ClipboardCheck,
  TrendingUp,
  HelpCircle,
  Menu,
  ShoppingBag,
  ShoppingCart,
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
  { href: '/dashboard/seller/inspections', label: 'Inspections', icon: ClipboardCheck },
  { href: '/dashboard/seller/sales', label: 'Sales', icon: TrendingUp },
  { href: '/dashboard/seller/orders', label: 'Orders', icon: ShoppingBag },
]

const buyerNavItems: NavItem[] = [
  { href: '/dashboard/buyer', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/buyer/auctions', label: 'Auctions', icon: Calendar },
  { href: '/dashboard/buyer/watchlist', label: 'Watchlist', icon: Heart },
  { href: '/dashboard/buyer/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/dashboard/buyer/orders', label: 'Orders', icon: ShoppingBag },
]

const SIDEBAR_COLLAPSED_KEY = 'probid-seller-sidebar-collapsed'

export function DashboardSidebar({ role }: { role: 'seller' | 'buyer' }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const items = role === 'seller' ? sellerNavItems : buyerNavItems

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
    } catch {
      // ignore
    }
  }, [collapsed])

  const navLinks = (items ?? []).map((item) => {
    const Icon = item.icon
    const isActive = location.pathname === item.href
    return (
      <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}>
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
            isActive
              ? 'bg-primary text-primary-foreground shadow-accent-glow'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </div>
      </Link>
    )
  })

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-24 right-4 z-50 flex md:hidden h-12 w-12 rounded-full bg-probid-charcoal text-probid-accent shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'flex flex-col border-r border-[rgb(var(--border))] bg-card transition-all duration-300 z-40',
          collapsed ? 'w-[72px]' : 'w-64',
          'fixed inset-y-0 left-0 md:relative md:left-auto md:inset-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
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
            className="shrink-0 hidden md:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-2">{navLinks}</nav>
        <div className="border-t border-[rgb(var(--border))] p-2">
          <Link to="/settings" onClick={() => setMobileOpen(false)}>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <Settings className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </div>
          </Link>
          <Link to="/help" onClick={() => setMobileOpen(false)}>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <HelpCircle className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Support</span>}
            </div>
          </Link>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around rounded-t-2xl border-t border-[rgb(var(--border))] bg-probid-charcoal px-2 py-2 shadow-[0_-4px_20px_rgba(22,22,22,0.15)]">
        {(items ?? []).slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 min-w-[44px] min-h-[44px] justify-center"
                aria-label={item.label}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-probid-accent' : 'text-white/70'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    isActive ? 'text-probid-accent' : 'text-white/70'
                  )}
                >
                  {item.label.length > 10 ? item.label.slice(0, 8) + '…' : item.label}
                </span>
              </Link>
            )
          })}
        </nav>
    </>
  )
}
