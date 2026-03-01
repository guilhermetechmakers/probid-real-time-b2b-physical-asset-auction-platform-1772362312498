/**
 * DataVizPanel - Lightweight charts for user stats (KYC, subscription, bans).
 */
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileCheck, CreditCard, Ban } from 'lucide-react'
import type { AdminUser } from '@/types/admin'

interface DataVizPanelProps {
  users: AdminUser[]
}

export function DataVizPanel({ users }: DataVizPanelProps) {
  const stats = useMemo(() => {
    const list = users ?? []
    const kycCounts = { pending: 0, submitted: 0, approved: 0, rejected: 0, needs_action: 0, none: 0 }
    const subCounts = { active: 0, past_due: 0, cancelled: 0, inactive: 0, none: 0 }
    let banned = 0
    let restricted = 0

    for (const u of list) {
      const kyc = (u.kycStatus ?? 'pending').toLowerCase()
      kycCounts[kyc as keyof typeof kycCounts] = (kycCounts[kyc as keyof typeof kycCounts] ?? 0) + 1
      const sub = (u.subscriptionStatus ?? 'none').toLowerCase()
      subCounts[sub as keyof typeof subCounts] = (subCounts[sub as keyof typeof subCounts] ?? 0) + 1
      if (u.isBanned) banned++
      if (u.hasRestrictions) restricted++
    }

    const kycData = [
      { name: 'Pending', count: kycCounts.pending, fill: 'rgb(126, 126, 126)' },
      { name: 'Submitted', count: kycCounts.submitted, fill: 'rgb(245, 158, 11)' },
      { name: 'Approved', count: kycCounts.approved, fill: 'rgb(46, 213, 115)' },
      { name: 'Rejected', count: kycCounts.rejected, fill: 'rgb(255, 77, 79)' },
      { name: 'N/A', count: kycCounts.none, fill: 'rgb(229, 229, 234)' },
    ].filter((d) => d.count > 0)

    const subData = [
      { name: 'Active', count: subCounts.active, fill: 'rgb(239, 253, 45)' },
      { name: 'Past Due', count: subCounts.past_due, fill: 'rgb(255, 77, 79)' },
      { name: 'Cancelled', count: subCounts.cancelled, fill: 'rgb(126, 126, 126)' },
      { name: 'None', count: subCounts.none, fill: 'rgb(229, 229, 234)' },
    ].filter((d) => d.count > 0)

    return {
      total: list.length,
      banned,
      restricted,
      kycData,
      subData,
    }
  }, [users])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-2xl border-[rgb(var(--border))] shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total}</p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-[rgb(var(--border))] shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Banned</CardTitle>
          <Ban className="h-5 w-5 text-destructive" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.banned}</p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-[rgb(var(--border))] shadow-card sm:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
          <FileCheck className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.kycData.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No data</p>
          ) : (
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.kycData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#EFFD2D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-[rgb(var(--border))] shadow-card sm:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          <CreditCard className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.subData.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No data</p>
          ) : (
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.subData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#EFFD2D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
