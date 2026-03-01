import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Gavel, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PasswordInput } from '@/components/ui/password-input'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/auth-validation'
import { PasswordStrengthMeter } from './password-strength-meter'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

/**
 * PasswordResetForm - Set new password with strength meter and match validation.
 * Used when user has valid recovery session (from Supabase reset link).
 */
export function PasswordResetForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const passwordValue = watch('password') ?? ''

  async function onSubmit(data: ResetPasswordFormData) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) throw error
      toast.success('Password updated successfully')
      navigate('/auth?mode=login', { replace: true })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update password'
      )
    } finally {
      setIsLoading(false)
    }
  }

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
            Set new password
          </CardTitle>
          <CardDescription>
            Enter your new password below. Use at least 8 characters with
            uppercase, lowercase, numbers, and special characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="reset-password">New password</Label>
              <PasswordInput
                id="reset-password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'reset-password-error' : undefined
                }
                className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
              />
              <PasswordStrengthMeter password={passwordValue} />
              {errors.password && (
                <p
                  id="reset-password-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password">Confirm password</Label>
              <PasswordInput
                id="reset-confirm-password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword
                    ? 'reset-confirm-password-error'
                    : undefined
                }
                className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
              />
              {errors.confirmPassword && (
                <p
                  id="reset-confirm-password-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className={cn(
                'w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-accent-glow',
                'bg-primary text-primary-foreground'
              )}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
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
