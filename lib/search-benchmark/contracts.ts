import { z } from 'zod'

const roleSlugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/u)

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
const countSchema = z.int().min(0).max(10_000)

export const searchBenchmarkCreateBodySchema = z
  .strictObject({
    // The catalogue validates the selected value inside the atomic write.
    // Underscores remain valid for historic clients during the transition.
    role: roleSlugSchema,
    sector: z.enum(searchBenchmarkSectors),
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

  })

export const searchBenchmarkIdempotencyKeySchema = z.uuid()

export const searchBenchmarkLiveComparisonSchema = z.strictObject({
  status: z.enum(['live', 'collecting']),
  matchLevel: z.enum(['exact', 'role_level_region', 'role_level', 'role']).nullable(),
  cohortSize: z.number().int().nonnegative(),
  durationDaysMedian: z.number().int().nonnegative().nullable(),
  durationDaysP25: z.number().int().nonnegative().nullable(),
  durationDaysP75: z.number().int().nonnegative().nullable(),
  applicationsPerMonthMedian: z.number().int().nonnegative().nullable(),
  responseRate: z.number().nonnegative().nullable(),
  interviewRate: z.number().nonnegative().nullable(),
})

export const searchBenchmarkCreateResultSchema = z.strictObject({
  receiptId: z.uuid(),
  searchEpisodeId: z.uuid(),
  submissionCapability: z
    .string()
    .regex(/^[A-Za-z0-9_-]{43}$/u)
    .nullable(),
  replayed: z.boolean(),
  comparison: searchBenchmarkLiveComparisonSchema.nullable(),
})

export type SearchBenchmarkCreateBody = z.infer<
  typeof searchBenchmarkCreateBodySchema
>
export type SearchBenchmarkCreateResult = z.infer<
  typeof searchBenchmarkCreateResultSchema
>
export type SearchBenchmarkLiveComparison = z.infer<
  typeof searchBenchmarkLiveComparisonSchema
>
