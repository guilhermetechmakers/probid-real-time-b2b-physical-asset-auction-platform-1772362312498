/**
 * ChatFeed - Read-only buyer chat + ops messages; input disabled for buyers.
 */
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChatMessage {
  id: string
  senderRole: 'buyer' | 'ops' | 'admin'
  message: string
  timestamp: string
}

export interface ChatFeedProps {
  messages?: ChatMessage[]
  canPost?: boolean
  onPost?: (message: string) => void
  isPosting?: boolean
  className?: string
}

export function ChatFeed({
  messages = [],
  canPost = false,
  onPost,
  isPosting = false,
  className,
}: ChatFeedProps) {
  const [input, setInput] = useState('')
  const safe = Array.isArray(messages) ? messages : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed && onPost && canPost && !isPosting) {
      onPost(trimmed)
      setInput('')
    }
  }

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
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="max-h-48 space-y-2 overflow-y-auto"
          role="log"
          aria-live="polite"
        >
          {safe.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No messages yet.
            </p>
          ) : (
            (safe ?? []).map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm',
                  msg.senderRole === 'ops' || msg.senderRole === 'admin'
                    ? 'bg-primary/10 text-foreground'
                    : 'bg-[rgb(var(--secondary))] text-muted-foreground'
                )}
              >
                <p>{msg.message}</p>
                <p className="mt-1 text-xs opacity-80">{msg.timestamp}</p>
              </div>
            ))
          )}
        </div>
        {canPost ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              disabled={isPosting}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isPosting}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground">
            Chat is read-only for buyers.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
