import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type SignUpStep = 1 | 2 | 3

export interface SignUpFormState {
  step: SignUpStep
  email: string
  password: string
  confirmPassword: string
  role: 'seller' | 'buyer'
  fullName: string
  companyName: string
  taxId: string
  acceptTerms: boolean
}

const initialState: SignUpFormState = {
  step: 1,
  email: '',
  password: '',
  confirmPassword: '',
  role: 'buyer',
  fullName: '',
  companyName: '',
  taxId: '',
  acceptTerms: false,
}

export type SignUpAction =
  | { type: 'NEXT'; payload?: Partial<SignUpFormState> }
  | { type: 'PREV' }
  | { type: 'SET'; payload: Partial<SignUpFormState> }
  | { type: 'RESET' }

function signUpReducer(
  state: SignUpFormState,
  action: SignUpAction
): SignUpFormState {
  switch (action.type) {
    case 'NEXT': {
      const next = Math.min(3, state.step + 1) as SignUpStep
      return { ...state, ...action.payload, step: next }
    }
    case 'PREV': {
      const prev = Math.max(1, state.step - 1) as SignUpStep
      return { ...state, step: prev }
    }
    case 'SET':
      return { ...state, ...action.payload }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

interface SignUpStepperProps {
  state: SignUpFormState
  dispatch: React.Dispatch<SignUpAction>
  step1: ReactNode
  step2: ReactNode
  step3: ReactNode
  className?: string
}

const stepLabels: Record<SignUpStep, string> = {
  1: 'Account details',
  2: 'Role selection',
  3: 'Additional info',
}

export function SignUpStepper({
  state,
  dispatch,
  step1,
  step2,
  step3,
  className,
}: SignUpStepperProps) {
  const currentStep = state.step

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress indicator */}
      <div
        className="flex gap-2"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-label={`Sign up step ${currentStep} of 3`}
      >
        {([1, 2, 3] as const).map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => step <= currentStep && dispatch({ type: 'SET', payload: { step } })}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              step <= currentStep
                ? 'bg-primary'
                : 'bg-[rgb(var(--border))]'
            )}
            aria-current={step === currentStep ? 'step' : undefined}
            disabled={step > currentStep}
          />
        ))}
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Step {currentStep} of 3: {stepLabels[currentStep]}
      </p>

      {/* Step content with animation */}
      <div
        key={currentStep}
        className="animate-in-up"
        role="region"
        aria-live="polite"
        aria-label={stepLabels[currentStep]}
      >
        {currentStep === 1 && step1}
        {currentStep === 2 && step2}
        {currentStep === 3 && step3}
      </div>
    </div>
  )
}

export { signUpReducer, initialState }
