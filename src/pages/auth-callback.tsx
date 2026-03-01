import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

/**
 * Handles OAuth callback from Supabase (Google, Apple).
 * Supabase redirects here after OAuth; we exchange the code for a session.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        navigate('/auth?mode=login&error=oauth_failed', { replace: true })
        return
      }
      if (session?.user) {
        const meta = session.user.user_metadata ?? {}
        const role = meta.role ?? 'buyer'
        navigate(
          role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer',
          { replace: true }
        )
      } else {
        navigate('/auth?mode=login', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground">Completing sign in...</p>
    </div>
  )
}
