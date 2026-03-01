/**
 * UserManagementAdminPage - Admin user management with filters, table, bulk actions.
 */
import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAdminUsers, type FetchAdminUsersParams } from '@/api/admin'
import type { AdminUser } from '@/types/admin'
import { KYCStatusBadge } from './kyc-status-badge'
import { SubscriptionStatusBadge } from './subscription-status-badge'
import { UserDetailDrawer } from './user-detail-drawer'
import { BulkActionsPanel } from './bulk-actions-panel'
import { DataVizPanel } from './data-viz-panel'
import { cn } from '@/lib/utils'

const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'ops', label: 'Ops' },
  { value: 'seller', label: 'Seller' },
  { value: 'buyer', label: 'Buyer' },
]

const KYC_OPTIONS = [
  { value: 'all', label: 'All KYC' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const SUB_OPTIONS = [
  { value: 'all', label: 'All plans' },
  { value: 'active', label: 'Active' },
  { value: 'past_due', label: 'Past due' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'none', label: 'None' },
]

const PAGE_SIZE = 20

export function UserManagementAdmin() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [kycFilter, setKycFilter] = useState('all')
  const [subscriptionFilter, setSubscriptionFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailUserId, setDetailUserId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [page, setPage] = useState(1)

  const params: FetchAdminUsersParams = useMemo(
    () => ({
      search: search || undefined,
      role: roleFilter && roleFilter !== 'all' ? roleFilter : undefined,
      kyc: kycFilter && kycFilter !== 'all' ? kycFilter : undefined,
      subscription: subscriptionFilter && subscriptionFilter !== 'all' ? subscriptionFilter : undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, roleFilter, kycFilter, subscriptionFilter, page]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => fetchAdminUsers(params),
  })

  const users = (data?.users ?? []) as AdminUser[]

  const filteredUsers = useMemo(() => {
    let list = users
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(s) ||
          (u.name ?? '').toLowerCase().includes(s) ||
          u.id.toLowerCase().includes(s)
      )
    }
    return list
  }, [users, search])

  const stats = useMemo(() => {
    const kycByStatus: Record<string, number> = {}
    const subscriptionByStatus: Record<string, number> = {}
    let bannedCount = 0
    for (const u of users) {
      kycByStatus[u.kycStatus] = (kycByStatus[u.kycStatus] ?? 0) + 1
      const sub = u.subscriptionStatus ?? 'none'
      subscriptionByStatus[sub] = (subscriptionByStatus[sub] ?? 0) + 1
      if (u.isBanned) bannedCount++
    }
    return {
      kycByStatus,
      subscriptionByStatus,
      bannedCount,
      totalCount: users.length,
    }
  }, [users])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredUsers.map((u) => u.id)))
    }
  }, [selectedIds.size, filteredUsers])

  const openDetail = useCallback((userId: string) => {
    setDetailUserId(userId)
    setDetailOpen(true)
  }, [])

  const handleSuccess = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="mt-1 text-muted-foreground">
          Manage users, KYC status, subscriptions, and bans
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email, name, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search users"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={kycFilter} onValueChange={setKycFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="KYC" />
            </SelectTrigger>
            <SelectContent>
              {KYC_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Subscription" />
            </SelectTrigger>
            <SelectContent>
              {SUB_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataVizPanel
        kycByStatus={stats.kycByStatus}
        subscriptionByStatus={stats.subscriptionByStatus}
        bannedCount={stats.bannedCount}
        totalCount={stats.totalCount}
      />

      <div className="flex items-center justify-between">
        <BulkActionsPanel
          selectedIds={Array.from(selectedIds)}
          onSuccess={handleSuccess}
          onClearSelection={() => setSelectedIds(new Set())}
        />
      </div>

      <Card className="overflow-hidden rounded-xl border-[rgb(var(--border))] shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 border-b border-[rgb(var(--border))] bg-card">
                    <tr>
                      <th className="w-10 px-4 py-3">
                        <Checkbox
                          checked={selectedIds.size === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">KYC</th>
                      <th className="px-4 py-3 font-medium">Subscription</th>
                      <th className="px-4 py-3 font-medium">Ban</th>
                      <th className="px-4 py-3 font-medium">Last Active</th>
                      <th className="w-12 px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={cn(
                          'border-b border-[rgb(var(--border))] transition-colors hover:bg-secondary/50',
                          selectedIds.has(user.id) && 'bg-primary/5'
                        )}
                      >
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedIds.has(user.id)}
                            onCheckedChange={() => toggleSelect(user.id)}
                            aria-label={`Select ${user.email}`}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{user.name ?? '—'}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                            {String(user.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <KYCStatusBadge status={user.kycStatus} showIcon={false} />
                        </td>
                        <td className="px-4 py-3">
                          <SubscriptionStatusBadge
                            status={user.subscriptionStatus ?? 'none'}
                            plan={user.subscriptionPlan}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {user.isBanned ? (
                            <span className="text-destructive font-medium">Banned</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {user.lastActive
                            ? new Date(user.lastActive).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label="Actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetail(user.id)}>
                                View details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length >= PAGE_SIZE && (
                <div className="flex items-center justify-between border-t border-[rgb(var(--border))] px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={users.length < PAGE_SIZE}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <UserDetailDrawer
        userId={detailUserId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
