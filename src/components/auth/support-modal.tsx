import { Link } from 'react-router-dom'
import { Mail, MessageCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const SUPPORT_EMAIL = 'support@probid.com'
const SUPPORT_SUBJECT = 'Email Verification Help'

interface SupportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Lightweight modal providing contact methods for verification issues.
 * Accessible, keyboard-focusable, screen-reader friendly.
 */
export function SupportModal({ open, onOpenChange }: SupportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-labelledby="support-modal-title"
        aria-describedby="support-modal-desc"
      >
        <DialogHeader>
          <DialogTitle id="support-modal-title">
            Contact Support
          </DialogTitle>
          <DialogDescription id="support-modal-desc">
            Having trouble with email verification? Reach out through one of these
            options.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}`}
            className="flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))] p-4 transition-all duration-200 hover:border-primary hover:shadow-accent-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Send email to support at ${SUPPORT_EMAIL}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">{SUPPORT_EMAIL}</p>
            </div>
          </a>
          <Link
            to="/help"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))] p-4 transition-all duration-200 hover:border-primary hover:shadow-accent-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Visit help center"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                Help center
              </p>
              <p className="text-sm text-muted-foreground">
                Visit our help page for common verification issues
              </p>
            </div>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
