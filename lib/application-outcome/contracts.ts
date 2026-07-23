import { z } from 'zod'

export const applicationChannels = [
  'linkedin',
  'job_board',
  'company_site',
  'referral',
  'recruiter_outreach',
  'other',
] as const

export const applicationStages = [
  'application',
  'hr_screen',
  'technical',
  'final',
  'offer',
] as const

export const applicationOutcomes = [
  'awaiting_response',
  'interviewing',
  'automated_rejection',
  'manual_rejection',
  'offer_received',
  'offer_declined',
  'offer_accepted',
  'employment_started',
  'employment_not_started',
  'application_withdrawn',
] as const

export const terminalApplicationOutcomes = [
  'automated_rejection',
  'manual_rejection',
  'offer_declined',
  'employment_started',
  'employment_not_started',
  'application_withdrawn',
] as const

export const applicationMonthSchema = z
  .string()
  .regex(/^(?:19|20)[0-9]{2}-(?:0[1-9]|1[0-2])$/u)

export const applicationContextSchema = z.strictObject({
  applicationMonth: applicationMonthSchema,
  applicationChannel: z.enum(applicationChannels),
  hadReferral: z.boolean(),
  lastStage: z.enum(applicationStages),
  currentOutcome: z.enum(applicationOutcomes),
  outcomeMonth: applicationMonthSchema.nullable(),
  plannedStartMonth: applicationMonthSchema.nullable(),
})

export const applicationOutcomeFollowUpBodySchema = z
  .strictObject({
    outcome: z.enum(applicationOutcomes),
    occurredMonth: applicationMonthSchema.nullable(),
    plannedStartMonth: applicationMonthSchema.nullable(),
  })
  .superRefine((value, context) => {
    const ongoing = ['awaiting_response', 'interviewing'].includes(value.outcome)
    if (ongoing !== (value.occurredMonth === null)) {
      context.addIssue({
        code: 'custom',
        path: ['occurredMonth'],
        message: 'Completed outcomes require a month; ongoing outcomes do not',
      })
    }
    if (
      value.plannedStartMonth !== null &&
      !['offer_accepted', 'employment_started'].includes(value.outcome)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['plannedStartMonth'],
        message: 'A planned start belongs to an accepted offer',
      })
    }
  })

export const applicationOutcomeIdempotencyKeySchema = z.uuid()

export const applicationOutcomeFollowUpResultSchema = z.strictObject({
  applicationId: z.uuid(),
  outcomeEventId: z.uuid(),
  outcome: z.enum(applicationOutcomes),
  replayed: z.boolean(),
})

export type ApplicationOutcomeFollowUpResult = z.infer<
  typeof applicationOutcomeFollowUpResultSchema
>
