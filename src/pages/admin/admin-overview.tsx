/**
 * Admin Overview - Main hub with key metrics and quick links.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardCheck,
  Users,
  Gavel,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchAdminMetrics } from '@/api/admin'
import type { AdminDashboardMetrics } from '@/types/admin'
import { cn } from '@/lib/utils'

const metricCards = [
  {
    key: 'pendingListings' as const,
    label: 'Pending Listings',
    href: '/admin/dashboard/ops',
    icon: ClipboardCheck,
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    key: 'pendingBuyerApprovals' as const,
    label: 'Buyer Approvals',
    href: '/admin/dashboard/buyers',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    key: 'liveAuctions' as const,
    label: 'Live Auctions',
    href: '/admin/dashboard/auctions',
    icon: Gavel,
    color: 'bg-success/10 text-[rgb(var(--success))]',
  },
  {
    key: 'openDisputes' as const,
    label: 'Open Disputes',
    href: '/admin/dashboard/disputes',
    icon: AlertTriangle,
    color: 'bg-destructive/10 text-destructive',
  },
  {
    key: 'totalRevenue' as const,
    label: 'Total Revenue',
    href: '/admin/dashboard/finance',
    icon: DollarSign,
    color: 'bg-primary/20 text-foreground',
  },
]

export function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics>({
    pendingListings: 0,
    pendingBuyerApprovals: 0,
    liveAuctions: 0,
    openDisputes: 0,
    totalRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAdminMetrics().then((m) => {
      if (cancelled) return
      setMetrics(m)
      setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Admin Overview</h1>
        <p className="mt-1 text-muted-foreground">
          Operations hub — review listings, approve buyers, monitor auctions, reconcile finance
        </p>
      </div>

      {/* Metric cards - bento-style grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {(metricCards ?? []).map((card) => {
          const Icon = card.icon
          const value = metrics[card.key]
          const displayValue =
            card.key === 'totalRevenue' ? `$${Number(value).toLocaleString()}` : String(value ?? 0)
          return (
            <Link key={card.key} to={card.href}>
              <Card className="h-full transition-all duration-200 hover:shadow-card-hover hover:scale-[1.02] cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </CardTitle>
                  <div className={cn('rounded-lg p-2', card.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-20 animate-pulse rounded bg-[rgb(var(--muted))]" />
                  ) : (
                    <p className="text-2xl font-bold">{displayValue}</p>
                  )}
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-probid-accent">
                    <span>View</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick actions */}
      <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/dashboard/ops">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Review Ops Queue
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/dashboard/buyers">
              <Users className="mr-2 h-4 w-4" />
              Approve Buyers
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/dashboard/auctions">
              <Gavel className="mr-2 h-4 w-4" />
              Monitor Auctions
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/dashboard/audit-logs">
              <FileText className="mr-2 h-4 w-4" />
              View Audit Logs
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
