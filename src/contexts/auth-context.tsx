import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'
import type { Session } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const mapSessionToUser = useCallback((s: Session | null): User | null => {
    if (!s?.user) return null
    const meta = s.user.user_metadata ?? {}
    return {
      id: s.user.id,
      email: s.user.email ?? '',
      role: (meta.role as User['role']) ?? 'buyer',
      fullName: meta.full_name ?? meta.name,
      avatarUrl: meta.avatar_url,
      kycStatus: meta.kyc_status,
      subscriptionStatus: meta.subscription_status,
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(mapSessionToUser(s))
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(mapSessionToUser(s))
    })

    return () => subscription.unsubscribe()
  }, [mapSessionToUser])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, isLoading, signOut }),
    [user, session, isLoading, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
