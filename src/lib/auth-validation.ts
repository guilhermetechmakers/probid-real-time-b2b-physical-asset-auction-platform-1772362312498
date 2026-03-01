import { z } from 'zod'

/** Email validation schema */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')

/** Password validation - minimum 8 chars */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

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
