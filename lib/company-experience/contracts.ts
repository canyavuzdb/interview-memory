import { z } from 'zod'

import { applicationContextSchema } from '@/lib/application-outcome/contracts'

export const companyExperiencePromisedTimelines = [
  'yes',
  'no',
  'not_specified',
] as const
export const companyExperienceGhostedStages = [
  'application',
  'hr_screen',
  'technical',
  'final',
] as const
export const companyExperienceIrrelevantTypes = [
  'age',
  'marital_status',
  'salary_history',
  'personal_questions',
  'other',
] as const
export const companyExperienceRejectionDetails = [
  'yes_detailed',
  'yes_generic',
  'no',
] as const
export const companyExperienceRecommendations = [
  'yes',
  'no',
  'unsure',
] as const

const cleanText = (maximum: number) =>
  z
    .string()
    .trim()
    .min(2)
    .max(maximum)
    .regex(/^[^\u0000-\u001f\u007f-\u009f]+$/u)
const days = z.int().min(0).max(3_650)
const rating = z.int().min(1).max(5)

export const companyExperienceCreateBodySchema = z
  .strictObject({
    companyName: cleanText(200),
    appliedRole: cleanText(120),
    processYear: z.int().min(2000).max(2100),
    promisedTimeline: z.enum(companyExperiencePromisedTimelines),
    promisedDays: days.nullable(),
    actualDays: days.nullable(),
    wasGhosted: z.boolean(),
    ghostedAfterStage: z.enum(companyExperienceGhostedStages).nullable(),
    interviewerPrepared: rating.nullable(),
    wasAskedIrrelevant: z.boolean(),
    irrelevantTypes: z.array(z.enum(companyExperienceIrrelevantTypes)).max(5),
    rejectionShared: z.enum(companyExperienceRejectionDetails),
    feedbackUseful: rating.nullable(),
    processTransparency: rating,
    hrProfessionalism: rating,
    wouldRecommendProcess: z.enum(companyExperienceRecommendations),
    freeNote: z.string().trim().max(500).nullable(),
    locale: z.enum(['tr', 'en']),
    consentGranted: z.literal(true),
    ...applicationContextSchema.shape,
  })
  .superRefine((value, context) => {
    const conditionalIssue = (valid: boolean, field: string, message: string) => {
      if (!valid) context.addIssue({ code: 'custom', path: [field], message })
    }

    conditionalIssue(
      value.promisedTimeline === 'yes'
        ? value.promisedDays !== null
        : value.promisedDays === null,
      'promisedDays',
      'Promised days must match the promised-timeline answer',
    )
    conditionalIssue(
      value.wasGhosted ? value.actualDays === null : value.actualDays !== null,
      'actualDays',
      'Actual days must match the ghosting answer',
    )
    conditionalIssue(
      value.wasGhosted
        ? value.ghostedAfterStage !== null
        : value.ghostedAfterStage === null,
      'ghostedAfterStage',
      'Ghosting stage must match the ghosting answer',
    )
    conditionalIssue(
      value.wasAskedIrrelevant
        ? value.irrelevantTypes.length > 0
        : value.irrelevantTypes.length === 0,
      'irrelevantTypes',
      'Question types must match the irrelevant-question answer',
    )
    conditionalIssue(
      value.rejectionShared === 'no'
        ? value.feedbackUseful === null
        : true,
      'feedbackUseful',
      'Feedback usefulness requires shared feedback',
    )
    const ongoingOutcome = ['awaiting_response', 'interviewing'].includes(
      value.currentOutcome,
    )
    conditionalIssue(
      ongoingOutcome
        ? value.outcomeMonth === null
        : value.outcomeMonth !== null,
      'outcomeMonth',
      'Completed outcomes require a month; ongoing outcomes do not',
    )
    conditionalIssue(
      value.plannedStartMonth === null ||
        ['offer_accepted', 'employment_started'].includes(
          value.currentOutcome,
        ),
      'plannedStartMonth',
      'A planned start belongs to an accepted offer',
    )
    conditionalIssue(
      ![
        'offer_received',
        'offer_declined',
        'offer_accepted',
        'employment_started',
        'employment_not_started',
      ].includes(value.currentOutcome) || value.lastStage === 'offer',
      'lastStage',
      'Offer outcomes require the offer stage',
    )
    conditionalIssue(
      value.currentOutcome !== 'interviewing' ||
        value.lastStage !== 'application',
      'lastStage',
      'An interviewing application must have reached an interview stage',
    )
    conditionalIssue(
      String(value.processYear) === value.applicationMonth.slice(0, 4),
      'applicationMonth',
      'Application month must match the process year',
    )
    conditionalIssue(
      value.outcomeMonth === null ||
        value.outcomeMonth >= value.applicationMonth,
      'outcomeMonth',
      'Outcome month cannot precede application month',
    )
    conditionalIssue(
      value.plannedStartMonth === null ||
        value.plannedStartMonth >= value.applicationMonth,
      'plannedStartMonth',
      'Planned start cannot precede application month',
    )
  })

export const companyExperienceIdempotencyKeySchema = z.uuid()

export const companyExperienceCreateResultSchema = z.strictObject({
  receiptId: z.uuid(),
  companyExperienceId: z.uuid(),
  jobApplicationId: z.uuid(),
  submissionCapability: z
    .string()
    .regex(/^[A-Za-z0-9_-]{43}$/u)
    .nullable(),
  replayed: z.boolean(),
})

export type CompanyExperienceCreateResult = z.infer<
  typeof companyExperienceCreateResultSchema
>
