import { useState, useReducer } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Gavel } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthForm } from '@/components/auth'
import { EmailVerificationGuideLink } from '@/components/auth/email-verification-guide-link'
import { LegalLinks } from '@/components/auth/legal-links'
import { signUpReducer, initialState } from '@/components/auth'
import { supabase } from '@/lib/supabase'
import type { LoginFormData } from '@/lib/auth-validation'
import type { SignUpFormState } from '@/components/auth'
import { cn } from '@/lib/utils'

export function SignInSignUpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const modeParam = searchParams.get('mode') as 'login' | 'signup' | null
  const initialMode = modeParam === 'signup' ? 'signup' : 'login'

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [isLoading, setIsLoading] = useState(false)
  const [signUpState, signUpDispatch] = useReducer(signUpReducer, initialState)

  async function handleLoginSubmit(data: LoginFormData) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) throw error
      toast.success('Welcome back!')
      navigate('/dashboard/buyer', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignUpSubmit(state: SignUpFormState) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: state.email,
        password: state.password,
        options: {
          data: {
            full_name: state.fullName,
            role: state.role,
            company_name: state.companyName || undefined,
            tax_id: state.taxId || undefined,
          },
        },
      })
      if (error) throw error
      toast.success('Check your email to verify your account')
      signUpDispatch({ type: 'RESET' })
      setMode('login')
      if (state.role === 'buyer') {
        navigate('/auth/verify-email?kyc=true', { replace: true })
      } else {
        navigate('/auth/verify-email', { replace: true })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
          <CardHeader className="space-y-6 pb-4">
            <Link
              to="/"
              className="mx-auto flex w-fit items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
              aria-label="ProBid home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-accent-glow">
                <Gavel className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">ProBid</span>
            </Link>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold">
                {mode === 'login' ? 'Log in' : 'Create an account'}
              </CardTitle>
              <CardDescription className="mt-2">
                {mode === 'login'
                  ? 'Enter your credentials to access your account'
                  : 'Choose your role and complete your profile'}
              </CardDescription>
            </div>
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as 'login' | 'signup')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="login"
                  className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Log in
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Sign up
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <AuthForm
              mode={mode}
              isLoading={isLoading}
              onLoginSubmit={handleLoginSubmit}
              onSignUpSubmit={handleSignUpSubmit}
              signUpState={signUpState}
              signUpDispatch={signUpDispatch}
            />
            <p className="text-center text-sm text-muted-foreground">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={cn(
                      'font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded'
                    )}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={cn(
                      'font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded'
                    )}
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
            <div className="flex flex-col items-center gap-4 pt-4 border-t border-[rgb(var(--border))]">
              <EmailVerificationGuideLink variant="inline" />
              <LegalLinks layout="row" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
