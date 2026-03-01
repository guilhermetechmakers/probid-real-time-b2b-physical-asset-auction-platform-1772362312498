import { PasswordResetTokenHandler } from '@/components/auth/password-reset-token-handler'

/**
 * Password reset token handler page - validates token and shows new password form.
 * Handles Supabase recovery flow (hash-based redirect).
 */
export function PasswordResetResetPage() {
  return <PasswordResetTokenHandler />
}
