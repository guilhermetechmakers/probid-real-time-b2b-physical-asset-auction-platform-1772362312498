/**
 * OpsNotesPanel - Reviewer notes with status, timestamp, expandable items.
 */

import { useState } from 'react'
import { FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OpsNoteEdit } from '@/types/listing-edit'
import { ensureArray } from '@/lib/safe-utils'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface OpsNotesPanelProps {
  notes: OpsNoteEdit[]
  onAddNote?: (note: string) => void
  canAddNote?: boolean
}

export function OpsNotesPanel({
  notes,
  onAddNote,
  canAddNote = true,
}: OpsNotesPanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const safeNotes = ensureArray(notes ?? [])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async () => {
    const trimmed = newNote.trim()
    if (!trimmed || !onAddNote) return
    setIsSubmitting(true)
    try {
      await onAddNote(trimmed)
      setNewNote('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCount = safeNotes.filter((n) => n.status === 'open').length

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Ops Notes
          {openCount > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({openCount} open)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canAddNote && onAddNote && (
          <div className="space-y-2">
            <Label htmlFor="new-note">Add note</Label>
            <div className="flex gap-2">
              <Input
                id="new-note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={isSubmitting}
              />
              <Button
                onClick={handleSubmit}
                disabled={!newNote.trim() || isSubmitting}
                className="shrink-0"
              >
                {isSubmitting ? 'Adding…' : 'Add'}
              </Button>
            </div>
          </div>
        )}

        <ul className="space-y-3" role="list" aria-label="Ops notes history">
          {safeNotes.map((note) => {
            const isExpanded = expandedIds.has(note.id)
            return (
              <li
                key={note.id}
                className={cn(
                  'rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/50 p-4 transition-all duration-200',
                  note.status === 'open' && 'border-l-4 border-l-primary'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2')}>
                      {note.note}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDateTime(note.createdAt)}
                      {note.status && ` • ${note.status}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggleExpand(note.id)}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>

        {safeNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No ops notes yet</p>
            <p className="text-xs text-muted-foreground">Notes from reviewers will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
