import { Link } from 'react-router-dom'
import { Bell, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications } from '@/hooks/use-seller-dashboard'
import { formatDateTime } from '@/lib/utils'

export function NotificationsPanel() {
  const { data: notifications, isLoading, error } = useNotifications()

  const list = Array.isArray(notifications) ? notifications : []

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">Failed to load notifications.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-probid-accent" />
          <h3 className="font-semibold">Notifications</h3>
        </div>
        {list.filter((n) => !n.read).length > 0 && (
          <span className="rounded-full bg-probid-accent px-2 py-0.5 text-xs font-medium text-probid-charcoal">
            {list.filter((n) => !n.read).length}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <ul className="space-y-2">
            {list.slice(0, 5).map((n) => (
              <li key={n.id}>
                <div
                  className={`flex items-start justify-between gap-2 rounded-lg p-3 transition-colors ${
                    !n.read ? 'bg-primary/10' : 'bg-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                  {n.actionUrl && (
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link to={n.actionUrl}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
