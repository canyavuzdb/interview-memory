import { z } from 'zod'

export const searchBenchmarkRoles = [
  'software_engineer',
  'frontend_developer',
  'backend_developer',
  'full_stack_developer',
  'mobile_developer',
  'data_analyst',
  'data_scientist',
  'product_manager',
  'product_designer',
  'devops_engineer',
  'qa_engineer',
  'business_analyst',
  'other',
] as const

export const searchBenchmarkSectors = [
  'technology',
  'finance',
  'ecommerce',
  'consulting',
  'healthcare',
  'manufacturing',
  'education',
  'media',
  'telecom',
  'other',
] as const

export const searchBenchmarkRoleLevels = [
  'intern',
  'junior',
  'mid',
  'senior',
  'lead_manager',
] as const

export const searchBenchmarkExperienceBands = [
  '0-1',
  '1-3',
  '3-5',
  '5-8',
  '8+',
] as const

export const searchBenchmarkTargetRegions = [
  'turkiye',
  'europe',
  'uk_ireland',
  'mena',
  'north_america',
  'other',
] as const

export const searchBenchmarkEmploymentTypes = [
  'full_time',
  'part_time',
  'freelance',
  'internship',
] as const

export const searchBenchmarkWorkModes = [
  'remote',
  'hybrid',
  'onsite',
] as const

export const searchBenchmarkStatuses = [
  'ongoing',
  'offer_accepted',
  'employment_started',
  'offer_rejected',
  'abandoned',
] as const

const monthSchema = z
  .string()
  .regex(/^(?:19|20)[0-9]{2}-(?:0[1-9]|1[0-2])$/u)
const countSchema = z.int().min(0).max(100_000)

export const searchBenchmarkCreateBodySchema = z
  .strictObject({
    role: z.enum(searchBenchmarkRoles),
    sector: z.enum(searchBenchmarkSectors).nullable(),
    roleLevel: z.enum(searchBenchmarkRoleLevels),
    experienceBand: z.enum(searchBenchmarkExperienceBands),
    targetRegion: z.enum(searchBenchmarkTargetRegions),
    employmentType: z.enum(searchBenchmarkEmploymentTypes).nullable(),
    workMode: z.enum(searchBenchmarkWorkModes).nullable(),
    isCurrentlyEmployed: z.boolean(),
    searchStartedAt: monthSchema,
    searchStatus: z.enum(searchBenchmarkStatuses),
    searchEndedAt: monthSchema.nullable(),
    applicationsCount: countSchema,
    humanResponsesCount: countSchema,
    anyInterviewsCount: countSchema,
    hrInterviewsCount: countSchema,
    technicalInterviewsCount: countSchema,
    offersCount: countSchema,
    acceptedOffersCount: countSchema,
    employmentStartedCount: countSchema,
    countsAreEstimated: z.boolean(),
    locale: z.enum(['tr', 'en']),
    consentGranted: z.literal(true),
  })
  .superRefine((value, context) => {
    if (value.searchStatus === 'ongoing' && value.searchEndedAt !== null) {
      context.addIssue({
        code: 'custom',
        path: ['searchEndedAt'],
        message: 'An ongoing search cannot have an end month',
      })
    }

    if (value.searchStatus !== 'ongoing' && value.searchEndedAt === null) {
      context.addIssue({
        code: 'custom',
        path: ['searchEndedAt'],
        message: 'A completed search requires an end month',
      })
    }

    if (
      value.searchEndedAt !== null &&
      value.searchEndedAt < value.searchStartedAt
    ) {
      context.addIssue({
        code: 'custom',
        path: ['searchEndedAt'],
        message: 'The end month cannot precede the start month',
      })
    }

    const boundedCounts: Array<[keyof typeof value, number]> = [
      ['humanResponsesCount', value.humanResponsesCount],
      ['anyInterviewsCount', value.anyInterviewsCount],
      ['hrInterviewsCount', value.hrInterviewsCount],
      ['technicalInterviewsCount', value.technicalInterviewsCount],
      ['offersCount', value.offersCount],
    ]

    for (const [field, count] of boundedCounts) {
      if (count > value.applicationsCount) {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: 'A funnel count cannot exceed applications',
        })
      }
    }

    for (const field of [
      'hrInterviewsCount',
      'technicalInterviewsCount',
    ] as const) {
      if (value[field] > value.anyInterviewsCount) {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: 'Interview-stage counts cannot exceed any interviews',
        })
      }
    }

    if (value.anyInterviewsCount > value.humanResponsesCount) {
      context.addIssue({
        code: 'custom',
        path: ['anyInterviewsCount'],
        message: 'Interview counts cannot exceed human responses',
      })
    }

    if (value.acceptedOffersCount > value.offersCount) {
      context.addIssue({
        code: 'custom',
        path: ['acceptedOffersCount'],
        message: 'Accepted offers cannot exceed offers',
      })
    }

    if (value.employmentStartedCount > value.acceptedOffersCount) {
      context.addIssue({
        code: 'custom',
        path: ['employmentStartedCount'],
        message: 'Employment starts cannot exceed accepted offers',
      })
    }

    if (
      value.searchStatus === 'offer_accepted' &&
      value.acceptedOffersCount === 0
    ) {
      context.addIssue({
        code: 'custom',
        path: ['acceptedOffersCount'],
        message: 'An accepted-offer search requires an accepted offer',
      })
    }

    if (
      value.searchStatus === 'employment_started' &&
      value.employmentStartedCount === 0
    ) {
      context.addIssue({
        code: 'custom',
        path: ['employmentStartedCount'],
        message: 'An employment-started search requires an employment start',
      })
    }

    if (value.searchStatus === 'offer_rejected' && value.offersCount === 0) {
      context.addIssue({
        code: 'custom',
        path: ['offersCount'],
        message: 'An offer-rejected search requires an offer',
      })
    }
  })

export const searchBenchmarkIdempotencyKeySchema = z.uuid()

export const searchBenchmarkCreateResultSchema = z.strictObject({
  receiptId: z.uuid(),
  searchEpisodeId: z.uuid(),
  submissionCapability: z
    .string()
    .regex(/^[A-Za-z0-9_-]{43}$/u)
    .nullable(),
  replayed: z.boolean(),
})

export type SearchBenchmarkCreateBody = z.infer<
  typeof searchBenchmarkCreateBodySchema
>
export type SearchBenchmarkCreateResult = z.infer<
  typeof searchBenchmarkCreateResultSchema
>
