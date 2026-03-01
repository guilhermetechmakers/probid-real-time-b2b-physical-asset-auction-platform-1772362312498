/**
 * ChatPanel - Ops announcements and system messages.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChatMessage {
  id: string
  type: 'system' | 'ops'
  message: string
  timestamp: string
}

export interface ChatPanelProps {
  messages?: ChatMessage[]
  className?: string
}

export function ChatPanel({ messages = [], className }: ChatPanelProps) {
  const safeMessages = Array.isArray(messages) ? messages : []

  return (
    <Card className={cn('transition-all duration-300', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safeMessages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No announcements yet.
          </p>
        ) : (
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {safeMessages.map((msg) => (
              <li
                key={msg.id}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm',
                  msg.type === 'system'
                    ? 'bg-[rgb(var(--secondary))] text-muted-foreground'
                    : 'bg-primary/10 text-foreground'
                )}
              >
                <p>{msg.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{msg.timestamp}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
