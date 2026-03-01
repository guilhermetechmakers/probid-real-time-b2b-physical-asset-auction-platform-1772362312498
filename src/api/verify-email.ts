/**
 * Email verification API layer.
 * Uses Supabase Auth verifyOtp and resend; can be swapped for Edge Functions.
 */

import { supabase } from '@/lib/supabase'

export interface UserPayload {
  id: string
  email: string
  name?: string
  emailVerified?: boolean
}

export interface VerificationResponse {
  success: boolean
  message?: string
  data?: UserPayload
}

export interface ResendResponse {
  success: boolean
  message?: string
}

type VerifyOtpType = 'signup' | 'email' | 'email_change'

/**
 * Verifies an email token from the verification link.
 * Supports Supabase verifyOtp for ?token=... or ?token_hash=... format.
 * Type defaults to 'signup' for signup confirmation.
 */
export async function verifyEmail(
  token: string,
  type: VerifyOtpType = 'signup'
): Promise<VerificationResponse> {
  const trimmed = token?.trim()
  if (!trimmed) {
    return { success: false, message: 'Verification token is required.' }
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: trimmed,
      type,
    })

    if (error) {
      const msg =
        error.message?.toLowerCase().includes('expired') ||
        error.message?.toLowerCase().includes('invalid')
          ? 'This verification link has expired or is invalid. Please request a new one.'
          : error.message ?? 'Verification failed.'
      return { success: false, message: msg }
    }

    const user = data?.user
    const payload: UserPayload | undefined = user
      ? {
          id: user.id,
          email: user.email ?? '',
          name: user.user_metadata?.full_name ?? user.user_metadata?.name,
          emailVerified: true,
        }
      : undefined

    return {
      success: true,
      message: 'Your email has been verified.',
      data: payload,
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.'
    return { success: false, message }
  }
}

/**
 * Resends the verification email.
 * Requires email when user is not authenticated.
 */
export async function resendVerification(params: {
  email?: string
  userId?: string
}): Promise<ResendResponse> {
  const { email, userId } = params ?? {}

  if (email?.trim()) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      })

      if (error) {
        const msg =
          error.message?.toLowerCase().includes('already')
            ? 'This email is already verified. You can sign in.'
            : error.message ?? 'Failed to resend verification email.'
        return { success: false, message: msg }
      }

      return {
        success: true,
        message: 'Verification email resent. Check your inbox.',
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to resend verification.'
      return { success: false, message }
    }
  }

  if (userId?.trim()) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user || user.id !== userId.trim()) {
      return {
        success: false,
        message: 'Unable to resend. Please provide your email address.',
      }
    }
    const userEmail = user.email ?? ''
    if (!userEmail) {
      return {
        success: false,
        message: 'Unable to resend. Please provide your email address.',
      }
    }
    return resendVerification({ email: userEmail })
  }

  return {
    success: false,
    message: 'Email address is required to resend verification.',
  }
}
