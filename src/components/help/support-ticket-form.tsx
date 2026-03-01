/**
 * SupportTicketForm - Form to submit a ticket with attachments, validation, success state.
 */
import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Paperclip, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { submitTicket } from '@/api/help'
import { cn } from '@/lib/utils'

const MAX_ATTACHMENTS = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

export interface SupportTicketFormProps {
  className?: string
}

export function SupportTicketForm({ className }: SupportTicketFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState<string>('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachError, setAttachError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  })

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachError('')
    const files = e.target.files
    if (!files || files.length === 0) return
    const arr = Array.from(files)
    if (arr.length + attachments.length > MAX_ATTACHMENTS) {
      setAttachError(`Maximum ${MAX_ATTACHMENTS} files allowed.`)
      return
    }
    const valid: File[] = []
    for (const f of arr) {
      if (f.size > MAX_FILE_SIZE) {
        setAttachError(`File "${f.name}" exceeds 10MB limit.`)
        return
      }
      if (!ALLOWED_TYPES.includes(f.type)) {
        setAttachError(`File "${f.name}" has unsupported type. Use images or PDF.`)
        return
      }
      valid.push(f)
    }
    setAttachments((prev) => [...prev, ...valid].slice(0, MAX_ATTACHMENTS))
  }, [attachments.length])

  const removeAttachment = useCallback((idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  const onSubmit = async (data: FormData) => {
    try {
      const result = await submitTicket({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        attachments: attachments.length > 0 ? attachments : undefined,
      })
      if (result.success && result.ticketId) {
        setTicketId(result.ticketId)
        setIsSubmitted(true)
        reset()
        setAttachments([])
        toast.success('Support ticket submitted successfully.')
      } else {
        toast.error(result.error ?? 'Failed to submit ticket.')
      }
    } catch {
      toast.error('Failed to submit ticket. Please try again.')
    }
  }

  if (isSubmitted) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 p-8 text-center',
          className
        )}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
          <Send className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Ticket Submitted</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ve received your request. Reference ID: <code className="font-mono text-primary">{ticketId}</code>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Our team will respond within 24–48 hours.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setIsSubmitted(false)
            setTicketId('')
          }}
        >
          Submit Another
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label htmlFor="ticket-name">Name</Label>
        <Input
          id="ticket-name"
          placeholder="Your name"
          {...register('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'ticket-name-error' : undefined}
        />
        {errors.name && (
          <p id="ticket-name-error" className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="ticket-email">Email</Label>
        <Input
          id="ticket-email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'ticket-email-error' : undefined}
        />
        {errors.email && (
          <p id="ticket-email-error" className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="ticket-subject">Subject</Label>
        <Input
          id="ticket-subject"
          placeholder="Brief subject"
          {...register('subject')}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? 'ticket-subject-error' : undefined}
        />
        {errors.subject && (
          <p id="ticket-subject-error" className="text-sm text-destructive" role="alert">
            {errors.subject.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="ticket-message">Message</Label>
        <Textarea
          id="ticket-message"
          placeholder="Describe your issue or question..."
          rows={5}
          {...register('message')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'ticket-message-error' : undefined}
        />
        {errors.message && (
          <p id="ticket-message-error" className="text-sm text-destructive" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="ticket-attachments">Attachments (optional, max 5, 10MB each)</Label>
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="ticket-attachments"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 px-4 py-2 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-[rgb(var(--secondary))]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Paperclip className="h-4 w-4" />
            Add files
          </label>
          <input
            id="ticket-attachments"
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(',')}
            className="sr-only"
            onChange={handleFileChange}
          />
          {(attachments ?? []).map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md bg-[rgb(var(--secondary))] px-2 py-1 text-xs"
            >
              {f.name}
              <button
                type="button"
                onClick={() => removeAttachment(i)}
                className="ml-1 text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${f.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {attachError && (
          <p className="text-sm text-destructive" role="alert">
            {attachError}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Ticket
          </>
        )}
      </Button>
    </form>
  )
}
