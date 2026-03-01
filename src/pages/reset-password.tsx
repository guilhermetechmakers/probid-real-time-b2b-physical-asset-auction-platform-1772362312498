import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Gavel, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const hash = searchParams.get('token') ?? window.location.hash
      if (hash && session) {
        setHasValidSession(true)
      } else if (!hash && !session) {
        setHasValidSession(false)
      } else {
        setHasValidSession(!!session)
      }
    })
  }, [searchParams])

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) throw error
      toast.success('Password updated successfully')
      navigate('/auth?mode=login', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  if (hasValidSession === false) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid or expired link</CardTitle>
            <CardDescription>
              This password reset link may have expired. Please request a new
              one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/forgot-password">Request new link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-12 sm:px-6">
      <Card className="w-full max-w-md transition-all duration-300 hover:shadow-card-hover">
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
          <CardTitle className="mt-6 text-2xl">Set new password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'UPDATE PASSWORD'
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/auth?mode=login" className="font-medium text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
