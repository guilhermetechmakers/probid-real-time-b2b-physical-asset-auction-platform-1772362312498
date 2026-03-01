import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Gavel, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  passwordResetRequestSchema,
  type PasswordResetRequestFormData,
} from '@/lib/auth-validation'
import { supabase } from '@/lib/supabase'
import { useRateLimiter } from '@/hooks'
import { cn } from '@/lib/utils'

/**
 * PasswordResetRequestForm - Request password reset email.
 * Uses non-enumeration-safe messaging; generic success regardless of email existence.
 */
export function PasswordResetRequestForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { recordAttempt, isLimited, secondsUntilReset } = useRateLimiter({
    maxAttempts: 3,
    windowMs: 60_000,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: PasswordResetRequestFormData) {
    if (isLimited) return
    setIsLoading(true)
    recordAttempt()
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/password-reset/reset`,
      })
      if (error) throw error
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const isDisabled = isLoading || isLimited

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-in-up rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="text-center">
          <Link
            to="/"
            className="mx-auto flex w-fit items-center gap-2"
            aria-label="ProBid home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Gavel className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ProBid</span>
          </Link>
          <CardTitle className="mt-6 text-2xl font-bold tracking-tight">
            Reset password
          </CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div
              className="space-y-4 rounded-xl border border-[rgb(var(--success))] bg-[rgb(var(--success))]/10 p-4 text-center"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm text-foreground">
                If an account with that email exists, a password reset link has
                been sent. Check your inbox and follow the instructions.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link to="/auth?mode=login">Back to login</Link>
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  {...register('email')}
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    errors.email ? 'reset-email-error' : undefined
                  }
                  disabled={isLimited}
                  className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
                />
                {errors.email && (
                  <p
                    id="reset-email-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
                {isLimited && (
                  <p className="text-sm text-muted-foreground">
                    Too many attempts. Try again in {secondsUntilReset} seconds.
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className={cn(
                  'w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-accent-glow',
                  'bg-primary text-primary-foreground'
                )}
                disabled={isDisabled}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          )}
          <p className="text-center text-sm text-muted-foreground">
            <Link
              to="/auth?mode=login"
              className="font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
