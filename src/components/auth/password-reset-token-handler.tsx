import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PasswordResetForm } from './password-reset-form'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type TokenState = 'checking' | 'valid' | 'invalid'

interface PasswordResetTokenHandlerProps {
  className?: string
}

/**
 * PasswordResetTokenHandler - Validates recovery token/session and renders
 * PasswordResetForm when valid, or error state when invalid/expired.
 * Handles Supabase's hash-based recovery flow (#access_token=...&type=recovery).
 */
export function PasswordResetTokenHandler({ className }: PasswordResetTokenHandlerProps) {
  const [tokenState, setTokenState] = useState<TokenState>('checking')

  useEffect(() => {
    const hasHash = typeof window !== 'undefined' && !!window.location.hash
    const hashParams = new URLSearchParams(
      window.location.hash?.replace(/^#/, '') ?? ''
    )
    const type = hashParams.get('type')

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        setTokenState('invalid')
        return
      }
      if (session && (type === 'recovery' || hasHash)) {
        setTokenState('valid')
      } else if (!hasHash && !session) {
        setTokenState('invalid')
      } else if (session) {
        setTokenState('valid')
      } else {
        setTokenState('invalid')
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setTokenState('valid')
        }
      }
    )

    checkSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (tokenState === 'checking') {
    return (
      <div
        className={cn(
          'flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4 py-12',
          className
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2
          className="h-10 w-10 animate-spin text-muted-foreground"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">
          Verifying reset link...
        </p>
      </div>
    )
  }

  if (tokenState === 'invalid') {
    return (
      <div className={cn('flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-6 px-4 py-12 animate-in', className)} role="alert">
        <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Invalid or expired link
            </p>
            <p className="text-sm text-muted-foreground">
              This password reset link may have expired or has already been used.
              Please request a new one.
            </p>
          </div>
        </div>
        <Button asChild className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-accent-glow">
          <Link to="/auth/password-reset">Request new reset link</Link>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/auth?mode=login"
            className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Back to login
          </Link>
        </p>
        </div>
      </div>
    )
  }

  return <PasswordResetForm />
}
