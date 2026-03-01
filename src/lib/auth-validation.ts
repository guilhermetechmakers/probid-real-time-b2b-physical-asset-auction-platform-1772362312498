import { z } from 'zod'

/** Email validation schema */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')

/** Password validation - minimum 8 chars (sign-up) */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

/** Password strength levels for UI indicator */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

/** Calculate password strength (0-4) */
export function getPasswordStrength(password: string): number {
  if (!password) return 0
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++
  return Math.min(strength, 4)
}

/** Map strength number to label */
export function getPasswordStrengthLabel(strength: number): PasswordStrength {
  if (strength <= 1) return 'weak'
  if (strength === 2) return 'fair'
  if (strength === 3) return 'good'
  return 'strong'
}

/** Password strength requirements for reset */
export const passwordStrengthSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

/** Password reset request schema */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>

/** Reset password form schema */
export const resetPasswordSchema = z
  .object({
    password: passwordStrengthSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/** Simpler password schema for login (no complexity) */
export const loginPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

/** Role enum for sign-up */
export const roleSchema = z.enum(['seller', 'buyer'])

/** Login form schema */
export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
  rememberMe: z.boolean().optional().default(false),
})

/** Sign-up step 1: account details */
export const signUpStep1Schema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

/** Sign-up step 2: role selection */
export const signUpStep2Schema = z.object({
  role: roleSchema,
})

/** Sign-up step 3: additional details */
export const signUpStep3Schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignUpStep1Data = z.infer<typeof signUpStep1Schema>
export type SignUpStep2Data = z.infer<typeof signUpStep2Schema>
export type SignUpStep3Data = z.infer<typeof signUpStep3Schema>
