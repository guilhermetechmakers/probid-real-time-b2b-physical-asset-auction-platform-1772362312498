import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  loginSchema,
  signUpStep1Schema,
  signUpStep2Schema,
  signUpStep3Schema,
  type LoginFormData,
} from '@/lib/auth-validation'
import { SignUpStepper, type SignUpFormState } from './sign-up-stepper'
import { BuyerKYCIntro } from './buyer-kyc-intro'
import { PasswordResetLink } from './password-reset-link'
import { OAuthButtons } from './oauth-buttons'
import { cn } from '@/lib/utils'

import type { SignUpAction } from './sign-up-stepper'

interface AuthFormProps {
  mode: 'login' | 'signup'
  isLoading: boolean
  onLoginSubmit: (data: LoginFormData) => Promise<void>
  onSignUpSubmit: (state: SignUpFormState) => Promise<void>
  signUpState: SignUpFormState
  signUpDispatch: React.Dispatch<SignUpAction>
  className?: string
}

export function AuthForm({
  mode,
  isLoading,
  onLoginSubmit,
  onSignUpSubmit,
  signUpState,
  signUpDispatch,
  className,
}: AuthFormProps) {
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({})
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({})
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({})

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  async function handleLoginSubmit(data: LoginFormData) {
    await onLoginSubmit(data)
  }

  function validateStep1(): boolean {
    const result = signUpStep1Schema.safeParse({
      email: signUpState.email,
      password: signUpState.password,
      confirmPassword: signUpState.confirmPassword,
    })
    if (!result.success) {
      const errors: Record<string, string> = {}
      const issues = result.error?.issues ?? []
      for (const i of issues) {
        const path = i.path?.[0] as string | undefined
        if (path) errors[path] = i.message ?? 'Invalid'
      }
      setStep1Errors(errors)
      return false
    }
    setStep1Errors({})
    return true
  }

  function validateStep2(): boolean {
    const result = signUpStep2Schema.safeParse({ role: signUpState.role })
    if (!result.success) {
      const errors: Record<string, string> = {}
      const issues = result.error?.issues ?? []
      for (const i of issues) {
        const path = i.path?.[0] as string | undefined
        if (path) errors[path] = i.message ?? 'Invalid'
      }
      setStep2Errors(errors)
      return false
    }
    setStep2Errors({})
    return true
  }

  function validateStep3(): boolean {
    const result = signUpStep3Schema.safeParse({
      fullName: signUpState.fullName,
      companyName: signUpState.companyName,
      taxId: signUpState.taxId,
      acceptTerms: signUpState.acceptTerms,
    })
    if (!result.success) {
      const errors: Record<string, string> = {}
      const issues = result.error?.issues ?? []
      for (const i of issues) {
        const path = i.path?.[0] as string | undefined
        if (path) errors[path] = i.message ?? 'Invalid'
      }
      setStep3Errors(errors)
      return false
    }
    setStep3Errors({})
    return true
  }

  async function handleSignUpNext() {
    if (signUpState.step === 1 && !validateStep1()) return
    if (signUpState.step === 2 && !validateStep2()) return
    if (signUpState.step === 3) {
      if (!validateStep3()) return
      await onSignUpSubmit(signUpState)
      return
    }
    signUpDispatch({ type: 'NEXT', payload: signUpState })
  }

  if (mode === 'login') {
    return (
      <div className={cn('space-y-4', className)}>
        <form
          onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...loginForm.register('email')}
              aria-invalid={!!loginForm.formState.errors.email}
              aria-describedby={
                loginForm.formState.errors.email
                  ? 'login-email-error'
                  : undefined
              }
            />
            {loginForm.formState.errors.email && (
              <p
                id="login-email-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {loginForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <PasswordResetLink />
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...loginForm.register('password')}
              aria-invalid={!!loginForm.formState.errors.password}
              aria-describedby={
                loginForm.formState.errors.password
                  ? 'login-password-error'
                  : undefined
              }
            />
            {loginForm.formState.errors.password && (
              <p
                id="login-password-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {loginForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-me"
              checked={loginForm.watch('rememberMe')}
              onCheckedChange={(checked) =>
                loginForm.setValue('rememberMe', !!checked)
              }
              aria-describedby="remember-me-desc"
            />
            <Label
              htmlFor="remember-me"
              id="remember-me-desc"
              className="text-sm font-normal cursor-pointer"
            >
              Remember me
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-accent-glow"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'SIGN IN'
            )}
          </Button>
        </form>
        <OAuthButtons disabled={isLoading} />
      </div>
    )
  }

  // Sign-up mode - step content
  const step1Content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={signUpState.email}
          onChange={(e) =>
            signUpDispatch({ type: 'SET', payload: { email: e.target.value } })
          }
          aria-invalid={!!step1Errors.email}
          aria-describedby={step1Errors.email ? 'signup-email-error' : undefined}
        />
        {step1Errors.email && (
          <p
            id="signup-email-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {step1Errors.email}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={signUpState.password}
          onChange={(e) =>
            signUpDispatch({ type: 'SET', payload: { password: e.target.value } })
          }
          aria-invalid={!!step1Errors.password}
          aria-describedby={
            step1Errors.password ? 'signup-password-error' : undefined
          }
        />
        {step1Errors.password && (
          <p
            id="signup-password-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {step1Errors.password}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Minimum 8 characters
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <Input
          id="signup-confirm"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={signUpState.confirmPassword}
          onChange={(e) =>
            signUpDispatch({
              type: 'SET',
              payload: { confirmPassword: e.target.value },
            })
          }
          aria-invalid={!!step1Errors.confirmPassword}
          aria-describedby={
            step1Errors.confirmPassword
              ? 'signup-confirm-error'
              : undefined
          }
        />
        {step1Errors.confirmPassword && (
          <p
            id="signup-confirm-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {step1Errors.confirmPassword}
          </p>
        )}
      </div>
    </div>
  )

  const step2Content = (
    <div className="space-y-4">
      <Label id="role-label">Choose your role</Label>
      <div
        className="grid grid-cols-2 gap-3"
        role="radiogroup"
        aria-labelledby="role-label"
        aria-describedby={step2Errors.role ? 'role-error' : undefined}
      >
        {(['buyer', 'seller'] as const).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() =>
              signUpDispatch({ type: 'SET', payload: { role } })
            }
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover',
              signUpState.role === role
                ? 'border-primary bg-primary/10 shadow-accent-glow'
                : 'border-[rgb(var(--border))] bg-[rgb(var(--secondary))] hover:border-primary/50'
            )}
            aria-pressed={signUpState.role === role}
            aria-label={`Select ${role}`}
          >
            <span className="text-lg font-semibold capitalize">{role}</span>
            <span className="text-xs text-muted-foreground">
              {role === 'buyer'
                ? 'Place bids on auctions'
                : 'List and sell assets'}
            </span>
          </button>
        ))}
      </div>
      {step2Errors.role && (
        <p id="role-error" className="text-sm text-destructive" role="alert">
          {step2Errors.role}
        </p>
      )}
      {signUpState.role === 'buyer' && (
        <BuyerKYCIntro className="mt-4" />
      )}
    </div>
  )

  const step3Content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-fullname">Full name</Label>
        <Input
          id="signup-fullname"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          value={signUpState.fullName}
          onChange={(e) =>
            signUpDispatch({ type: 'SET', payload: { fullName: e.target.value } })
          }
          aria-invalid={!!step3Errors.fullName}
          aria-describedby={
            step3Errors.fullName ? 'signup-fullname-error' : undefined
          }
        />
        {step3Errors.fullName && (
          <p
            id="signup-fullname-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {step3Errors.fullName}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-company">Company name (optional)</Label>
        <Input
          id="signup-company"
          type="text"
          placeholder="Acme Inc."
          autoComplete="organization"
          value={signUpState.companyName}
          onChange={(e) =>
            signUpDispatch({
              type: 'SET',
              payload: { companyName: e.target.value },
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-tax">Tax ID (optional)</Label>
        <Input
          id="signup-tax"
          type="text"
          placeholder="EIN or VAT"
          value={signUpState.taxId}
          onChange={(e) =>
            signUpDispatch({ type: 'SET', payload: { taxId: e.target.value } })
          }
        />
      </div>
      <div className="flex items-start gap-3">
        <Checkbox
          id="accept-terms"
          checked={signUpState.acceptTerms}
          onCheckedChange={(checked) =>
            signUpDispatch({ type: 'SET', payload: { acceptTerms: !!checked } })
          }
          aria-invalid={!!step3Errors.acceptTerms}
          aria-describedby={
            step3Errors.acceptTerms ? 'accept-terms-error' : undefined
          }
        />
        <div className="space-y-1">
          <Label
            htmlFor="accept-terms"
            className="text-sm font-normal cursor-pointer leading-tight"
          >
            I accept the{' '}
            <a
              href="/terms"
              className="text-primary underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              className="text-primary underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </Label>
          {step3Errors.acceptTerms && (
            <p
              id="accept-terms-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {step3Errors.acceptTerms}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn('space-y-4', className)}>
      <SignUpStepper
        state={signUpState}
        dispatch={signUpDispatch}
        step1={step1Content}
        step2={step2Content}
        step3={step3Content}
      />
      <div className="flex gap-3">
        {signUpState.step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => signUpDispatch({ type: 'PREV' })}
            className="flex-1"
          >
            Back
          </Button>
        )}
        <Button
          type="button"
          className={cn(
            'flex-1 transition-all duration-200 hover:scale-[1.02] hover:shadow-accent-glow',
            signUpState.step === 1 && 'flex-1'
          )}
          disabled={isLoading}
          onClick={handleSignUpNext}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : signUpState.step === 3 ? (
            'CREATE ACCOUNT'
          ) : (
            'CONTINUE'
          )}
        </Button>
      </div>
      <OAuthButtons disabled={isLoading} />
    </div>
  )
}
