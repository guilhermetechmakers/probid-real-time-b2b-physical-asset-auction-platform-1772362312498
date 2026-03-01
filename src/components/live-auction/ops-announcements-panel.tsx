/**
 * OpsAnnouncementsPanel - Pinned announcements with timestamps; real-time updates.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pin, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Announcement {
  id: string
  message: string
  postedBy?: string
  timestamp: string
  pinned?: boolean
}

export interface OpsAnnouncementsPanelProps {
  announcements?: Announcement[]
  className?: string
}

export function OpsAnnouncementsPanel({
  announcements = [],
  className,
}: OpsAnnouncementsPanelProps) {
  const safe = Array.isArray(announcements) ? announcements : []
  const pinned = safe.filter((a) => a.pinned)
  const rest = safe.filter((a) => !a.pinned)

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safe.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No announcements yet.
          </p>
        ) : (
          <ul className="max-h-48 space-y-2 overflow-y-auto" role="list">
            {(pinned ?? []).map((a) => (
              <li
                key={a.id}
                className="flex gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2"
              >
                <Pin className="h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">{a.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.postedBy ?? 'Ops'} • {a.timestamp}
                  </p>
                </div>
              </li>
            ))}
            {(rest ?? []).map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 px-3 py-2"
              >
                <p className="text-sm">{a.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.postedBy ?? 'Ops'} • {a.timestamp}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
