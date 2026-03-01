import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface PasswordResetLinkProps {
  className?: string
}

export function PasswordResetLink({ className }: PasswordResetLinkProps) {
  return (
    <Link
      to="/auth/password-reset"
      className={cn(
        'text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
        className
      )}
      aria-label="Reset your password"
    >
      Forgot password?
    </Link>
  )
}
