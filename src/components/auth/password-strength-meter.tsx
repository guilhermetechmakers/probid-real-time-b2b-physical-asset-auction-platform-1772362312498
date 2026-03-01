import { cn } from '@/lib/utils'
import {
  getPasswordStrength,
  getPasswordStrengthLabel,
  type PasswordStrength,
} from '@/lib/auth-validation'

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

const strengthColors: Record<PasswordStrength, string> = {
  weak: 'bg-destructive',
  fair: 'bg-amber-500',
  good: 'bg-[rgb(var(--success))]',
  strong: 'bg-[rgb(var(--success))]',
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(password)
  const label = getPasswordStrengthLabel(strength)

  if (!password) return null

  return (
    <div className={cn('space-y-1', className)} role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={4} aria-label={`Password strength: ${label}`}>
      <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-[rgb(var(--secondary))]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-full flex-1 rounded-full transition-all duration-300',
              i <= strength ? strengthColors[label] : 'bg-transparent'
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground capitalize">{label}</p>
    </div>
  )
}
