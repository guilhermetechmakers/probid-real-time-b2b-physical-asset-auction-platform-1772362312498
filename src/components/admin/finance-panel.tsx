/**
 * Finance Panel - Subscriptions, fees, deposits, payouts ledger.
 */
import { useQuery } from '@tanstack/react-query'
import { BarChart3, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchFinanceLedger } from '@/api/admin'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function FinancePanel() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['admin-finance-ledger'],
    queryFn: fetchFinanceLedger,
  })

  const total = (entries ?? []).reduce((sum, e) => sum + e.amount, 0)
  const byType = (entries ?? []).reduce(
    (acc, e) => {
      acc[e.type] = (acc[e.type] ?? 0) + e.amount
      return acc
    },
    {} as Record<string, number>
  )
  const chartData = Object.entries(byType).map(([type, value]) => ({ type, value }))

  return (
    <div className="space-y-6 animate-in-up">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">${total.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              By Type
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : chartData.length > 0 ? (
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="type" width={80} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Amount']} />
                    <Bar dataKey="value" radius={4} fill="#EFFD2D" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ledger</CardTitle>
          <p className="text-sm text-muted-foreground">Recent financial entries</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (entries ?? []).length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No ledger entries</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(entries ?? []).slice(0, 50).map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-[rgb(var(--border))] hover:bg-secondary/50"
                    >
                      <td className="py-3">{e.type}</td>
                      <td className="py-3 font-medium">
                        ${e.amount.toLocaleString()} {e.currency}
                      </td>
                      <td className="py-3">{e.status}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(e.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
