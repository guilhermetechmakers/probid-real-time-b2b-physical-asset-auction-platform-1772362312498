import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SupportModal } from '@/components/auth/support-modal'
import { verifyEmail, resendVerification } from '@/api/verify-email'
import type { UserPayload } from '@/api/verify-email'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'loading' | 'success' | 'failure'

export function EmailVerificationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string>('')
  const [, setUser] = useState<UserPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resendEmail, setResendEmail] = useState<string>('')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [supportOpen, setSupportOpen] = useState(false)
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const parsedQuery = Object.fromEntries(searchParams.entries())
  const tokenFromQuery = (parsedQuery?.token ?? '').trim()
  const typeFromQuery = (parsedQuery?.type ?? '').toLowerCase()

  const hasHash = typeof window !== 'undefined' && !!window.location.hash
  const hashParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.hash?.replace(/^#/, '') ?? '')
    : new URLSearchParams()
  const typeFromHash = hashParams.get('type')?.toLowerCase()

  const isEmailVerificationType =
    typeFromQuery === 'email' || typeFromHash === 'email'

  const validateToken = useCallback(async () => {
    if (!tokenFromQuery && !hasHash) {
      setStatus('failure')
      setMessage('No verification token found.')
      setError(
        'The verification link may be incomplete or invalid. Please use the link from your email, or request a new verification email.'
      )
      return
    }

    setStatus('loading')
    setMessage('Verifying your email...')
    setError(null)

    if (tokenFromQuery) {
      const result = await verifyEmail(tokenFromQuery)
      if (result.success) {
        setStatus('success')
        setMessage(result.message ?? 'Your email has been verified.')
        setUser(result.data ?? null)
        setError(null)
      } else {
        setStatus('failure')
        setMessage(result.message ?? 'Verification failed.')
        setError(result.message ?? null)
      }
      return
    }

    if (hasHash && isEmailVerificationType) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setStatus('success')
        setMessage('Your email has been verified.')
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name:
            session.user.user_metadata?.full_name ??
            session.user.user_metadata?.name,
          emailVerified: true,
        })
        setError(null)
      } else {
        const checkInterval = setInterval(async () => {
          const { data: { session: s } } = await supabase.auth.getSession()
          if (s?.user) {
            clearInterval(checkInterval)
            clearTimeout(timeoutId)
            checkIntervalRef.current = null
            timeoutRef.current = null
            setStatus('success')
            setMessage('Your email has been verified.')
            setUser({
              id: s.user.id,
              email: s.user.email ?? '',
              name:
                s.user.user_metadata?.full_name ??
                s.user.user_metadata?.name,
              emailVerified: true,
            })
            setError(null)
          }
        }, 300)
        const timeoutId = setTimeout(() => {
          clearInterval(checkInterval)
          setStatus('failure')
          setMessage('Verification timed out.')
          setError(
            'We could not verify your email. The link may have expired. Please request a new verification email.'
          )
        }, 10000)
        checkIntervalRef.current = checkInterval
        timeoutRef.current = timeoutId
      }
    }

    setStatus('failure')
    setMessage('Invalid verification link.')
    setError(
      'The verification link appears to be invalid or expired. Please request a new verification email.'
    )
  }, [tokenFromQuery, hasHash, isEmailVerificationType])

  useEffect(() => {
    validateToken()
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [validateToken])

  const handleResend = useCallback(async () => {
    const email = resendEmail.trim()
    if (!email) {
      toast.error('Please enter your email address.')
      return
    }

    setIsResending(true)
    setResendMessage(null)

    const result = await resendVerification({ email })

    if (result.success) {
      setResendMessage(result.message ?? 'Verification email resent.')
      toast.success(result.message ?? 'Verification email resent.')
    } else {
      setResendMessage(result.message ?? 'Failed to resend.')
      toast.error(result.message ?? 'Failed to resend verification email.')
    }

    setIsResending(false)
  }, [resendEmail])

  const navigateToDashboard = useCallback(() => {
    navigate('/dashboard/buyer', { replace: true })
  }, [navigate])

  const openSupport = useCallback(() => {
    setSupportOpen(true)
  }, [])

  if (status === 'loading') {
    return (
      <div
        className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-5 py-12 sm:px-6"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Card className="w-full max-w-md animate-in-up">
          <CardContent className="flex flex-col items-center gap-6 p-8 pt-8">
            <Loader2
              className="h-14 w-14 animate-spin text-primary"
              aria-hidden
            />
            <p className="text-center text-base font-medium text-foreground">
              Verifying your email...
            </p>
            <p className="text-center text-sm text-muted-foreground">
              This usually takes just a moment.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-5 py-12 sm:px-6">
        <Card className="w-full max-w-md animate-in-up transition-all duration-300 hover:shadow-card-hover">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--success))]/20">
              <CheckCircle2
                className="h-8 w-8 text-[rgb(var(--success))]"
                aria-hidden
              />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">
              Email verified
            </CardTitle>
            <CardDescription className="mt-2">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              onClick={navigateToDashboard}
              className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-accent-glow"
              aria-label="Go to dashboard"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/">Return home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'failure') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-5 py-12 sm:px-6">
        <Card className="w-full max-w-md animate-in-up transition-all duration-300 hover:shadow-card-hover">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
              <AlertCircle
                className="h-8 w-8 text-destructive"
                aria-hidden
              />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">
              Verification failed
            </CardTitle>
            <CardDescription className="mt-2">
              {error ?? message}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="space-y-4">
              <Label htmlFor="resend-email">Resend verification email</Label>
              <Input
                id="resend-email"
                type="email"
                placeholder="Enter your email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full"
                aria-label="Email address for resending verification"
              />
              {resendMessage && (
                <p
                  className={cn(
                    'text-sm',
                    resendMessage.toLowerCase().includes('resent')
                      ? 'text-[rgb(var(--success))]'
                      : 'text-muted-foreground'
                  )}
                >
                  {resendMessage}
                </p>
              )}
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending || !resendEmail.trim()}
                className="w-full"
                aria-label="Resend verification email"
              >
                {isResending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Resend verification email
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={navigateToDashboard}
                className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-accent-glow"
                aria-label="Go to dashboard"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
              <button
                type="button"
                onClick={openSupport}
                className={cn(
                  'inline-flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg py-2'
                )}
                aria-label="Contact support for verification issues"
              >
                <HelpCircle className="h-4 w-4" />
                Contact Support for verification issues
              </button>
            </div>
          </CardContent>
        </Card>

        <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
      </div>
    )
  }

  return null
}
