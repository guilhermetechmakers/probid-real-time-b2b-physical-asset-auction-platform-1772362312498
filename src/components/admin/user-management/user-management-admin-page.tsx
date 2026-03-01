/**
 * UserManagementAdminPage - Admin User Management with search, filters, table, bulk actions.
 */
import { useState, useMemo, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAdminUsers } from '@/api/admin'
import { KYCStatusBadge } from './kyc-status-badge'
import { SubscriptionStatusBadge } from './subscription-status-badge'
import { BulkActionsPanel } from './bulk-actions-panel'
import { UserDetailDrawer } from './user-detail-drawer'
import { DataVizPanel } from './data-viz-panel'
import type { AdminUser } from '@/types/admin'

const PAGE_SIZE = 20

export function UserManagementAdminPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [roleFilter, setRoleFilter] = useState('')
  const [kycFilter, setKycFilter] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState('')
  const [page, setPage] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailUserId, setDetailUserId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', debouncedSearch, roleFilter, kycFilter, subscriptionFilter, page],
    queryFn: () =>
      fetchAdminUsers({
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        kyc: kycFilter || undefined,
        subscription: subscriptionFilter || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  })

  const handleBulkActionSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    queryClient.invalidateQueries({ queryKey: ['admin-user-detail'] })
  }, [queryClient])

  const users = (data?.users ?? []) as AdminUser[]
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1

  const selectedUsers = useMemo(
    () => (users ?? []).filter((u) => selectedIds.has(u.id)),
    [users, selectedIds]
  )

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set((users ?? []).map((u) => u.id)))
    }
  }, [users, selectedIds.size])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const openDetail = useCallback((userId: string) => {
    setDetailUserId(userId)
    setDetailOpen(true)
  }, [])

  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="mt-1 text-muted-foreground">
          Manage users, KYC status, subscriptions, and enforcement actions
        </p>
      </div>

      <DataVizPanel users={users} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="pl-9"
            aria-label="Search users"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(0)
            }}
            className="h-11 rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 text-sm"
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="ops">Ops</option>
            <option value="seller">Seller</option>
            <option value="buyer">Buyer</option>
          </select>
          <select
            value={kycFilter}
            onChange={(e) => {
              setKycFilter(e.target.value)
              setPage(0)
            }}
            className="h-11 rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 text-sm"
            aria-label="Filter by KYC"
          >
            <option value="">All KYC</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={subscriptionFilter}
            onChange={(e) => {
              setSubscriptionFilter(e.target.value)
              setPage(0)
            }}
            className="h-11 rounded-lg border border-[rgb(var(--border))] bg-secondary px-4 text-sm"
            aria-label="Filter by subscription"
          >
            <option value="">All plans</option>
            <option value="active">Active</option>
            <option value="past_due">Past Due</option>
            <option value="cancelled">Cancelled</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      <BulkActionsPanel
        selectedUsers={selectedUsers}
        onClearSelection={clearSelection}
        onSuccess={handleBulkActionSuccess}
      />

      <Card className="overflow-hidden rounded-2xl border-[rgb(var(--border))] shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (users ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-secondary/95">
                    <tr className="border-b border-[rgb(var(--border))]">
                      <th className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds.size === users.length && users.length > 0}
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
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(users ?? []).map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-[rgb(var(--border))] transition-colors hover:bg-secondary/50"
                      >
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedIds.has(user.id)}
                            onCheckedChange={() => toggleSelect(user.id)}
                            aria-label={`Select ${user.email}`}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{user.name ?? '—'}</td>
                        <td className="px-4 py-3">{user.email ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize">
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
                            showIcon={false}
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
                          {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Actions">
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[rgb(var(--border))] px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages} ({total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
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
      />
    </div>
  )
}
