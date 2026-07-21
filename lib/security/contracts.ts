import { z } from 'zod'

const safeCodeSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/u)

export const quotaWindowSchema = z.strictObject({
  kind: safeCodeSchema,
  counter: z.enum(['attempt', 'accepted']),
  limit: z.int().min(1).max(100_000),
  durationSeconds: z.int().min(60).max(31_536_000),
})

export const quotaPolicyDocumentSchema = z.strictObject({
  $schema: z.string().min(1),
  version: z.string().min(1).max(80),
  policies: z.record(
    z.string().min(1),
    z.strictObject({
      scope: safeCodeSchema,
      windows: z.array(quotaWindowSchema).min(1),
    }),
  ),
})

export const quotaConsumeCommandSchema = z.strictObject({
  policy: z.string().min(1),
  windowKind: safeCodeSchema,
  counter: z.enum(['attempt', 'accepted']),
  subjectId: z.uuid(),
  now: z.date().optional(),
})

export const idempotencyClaimCommandSchema = z.strictObject({
  subjectType: z.enum(['data_subject', 'auth_user', 'capability']),
  subjectId: z.string().min(1).max(512),
  operationCode: safeCodeSchema,
  idempotencyKey: z.string().min(16).max(256),
  requestBody: z.unknown(),
  ttlSeconds: z.int().min(60).max(604_800),
  now: z.date().optional(),
})

export const idempotencyCompletionCommandSchema = z.strictObject({
  claim: z.strictObject({
    subjectType: z.enum(['data_subject', 'auth_user', 'capability']),
    subjectHmac: z.string().regex(/^\\x[0-9a-f]{64}$/u),
    operationCode: safeCodeSchema,
    idempotencyKeyHmac: z.string().regex(/^\\x[0-9a-f]{64}$/u),
    requestFingerprint: z.string().regex(/^\\x[0-9a-f]{64}$/u),
  }),
  resourceType: safeCodeSchema,
  resourceId: z.uuid(),
  responseCode: z.int().min(100).max(599),
})

export type QuotaPolicyDocument = z.infer<typeof quotaPolicyDocumentSchema>
export type QuotaWindow = z.infer<typeof quotaWindowSchema>
export type IdempotencyClaimCommand = z.infer<
  typeof idempotencyClaimCommandSchema
>
