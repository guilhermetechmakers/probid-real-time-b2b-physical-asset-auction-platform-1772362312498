import { Link } from 'react-router-dom'
import { Mail, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmailVerificationGuideLinkProps {
  variant?: 'inline' | 'card'
  className?: string
}

export function EmailVerificationGuideLink({
  variant = 'inline',
  className,
}: EmailVerificationGuideLinkProps) {
  if (variant === 'card') {
    return (
      <Link
        to="/auth/verify-email"
        className={cn(
          'flex items-start gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))] p-4 transition-all duration-200 hover:border-primary hover:shadow-accent-glow',
          className
        )}
        aria-label="Learn about email verification"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Verify your email
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your inbox for a verification link. Need help?
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
            View verification guide
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to="/auth/verify-email"
      className={cn(
        'inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
        className
      )}
      aria-label="Email verification guide"
    >
      <Mail className="h-4 w-4" />
      Email verification guide
    </Link>
  )
}
