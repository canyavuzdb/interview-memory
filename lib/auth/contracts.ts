import { z } from 'zod'

export const authLocales = ['tr', 'en'] as const
export const authLocaleSchema = z.enum(authLocales)

const emailSchema = z
  .string()
  .trim()
  .max(254)
  .pipe(z.email())
  .transform((value) => value.toLowerCase())
const currentPasswordSchema = z.string().min(1).max(128)
const newPasswordSchema = z.string().min(12).max(128)
const nextPathSchema = z.string().trim().max(200).nullable().default(null)

export const signInCommandSchema = z.strictObject({
  email: emailSchema,
  password: currentPasswordSchema,
  locale: authLocaleSchema,
  next: nextPathSchema,
})

export const signUpCommandSchema = z.strictObject({
  email: emailSchema,
  password: newPasswordSchema,
  locale: authLocaleSchema,
})

export const googleSignInCommandSchema = z.strictObject({
  locale: authLocaleSchema,
  next: nextPathSchema,
})

export const passwordRecoveryCommandSchema = z.strictObject({
  email: emailSchema,
  locale: authLocaleSchema,
})

export const passwordUpdateCommandSchema = z.strictObject({
  password: newPasswordSchema,
  locale: authLocaleSchema,
})

export const signOutCommandSchema = z.strictObject({
  locale: authLocaleSchema,
})

export const authCallbackCodeSchema = z.string().trim().min(1).max(4096)
export const authOtpTokenSchema = z.string().trim().min(16).max(4096)
export const authOtpTypeSchema = z.enum(['email', 'signup', 'recovery'])

export const accountContextDtoSchema = z.strictObject({
  userId: z.uuid(),
  locale: authLocaleSchema,
  timezone: z.string().trim().min(1).max(100),
  onboardingStatus: z.enum(['pending', 'completed', 'skipped']),
  accountStatus: z.literal('active'),
  version: z.int().positive(),
})

export type AuthLocale = z.infer<typeof authLocaleSchema>
export type AccountContextDto = z.infer<typeof accountContextDtoSchema>
