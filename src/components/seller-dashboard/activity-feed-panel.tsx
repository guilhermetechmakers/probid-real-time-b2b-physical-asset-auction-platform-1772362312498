import { Activity, Gavel, ClipboardCheck, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: string
  message: string
  timestamp: string
  actor?: string
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  bid_received: Gavel,
  inspection_scheduled: ClipboardCheck,
  win: CheckCircle,
  listing_approved: CheckCircle,
  listing_rejected: XCircle,
}

const defaultActivities: ActivityItem[] = [
  { id: '1', type: 'listing_approved', message: 'Listing "Industrial Forklift 2022" approved', timestamp: new Date().toISOString(), actor: 'Ops' },
  { id: '2', type: 'bid_received', message: 'New bid received on "Heavy Crane"', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', type: 'inspection_scheduled', message: 'Inspection scheduled for "Warehouse Racking"', timestamp: new Date(Date.now() - 86400000).toISOString(), actor: 'Inspector' },
]

interface ActivityFeedPanelProps {
  activities?: ActivityItem[]
  isLoading?: boolean
}

export function ActivityFeedPanel({ activities, isLoading }: ActivityFeedPanelProps) {
  const list = Array.isArray(activities) && activities.length > 0 ? activities : defaultActivities

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Activity className="h-5 w-5 text-probid-accent" />
        <h3 className="font-semibold">Activity Feed</h3>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {list.map((item) => {
            const Icon = ICON_MAP[item.type] ?? Activity
            return (
              <li
                key={item.id}
                className="flex gap-3 border-b border-[rgb(var(--border))] pb-4 last:border-0 last:pb-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDateTime(item.timestamp)}
                    {item.actor && ` · ${item.actor}`}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
