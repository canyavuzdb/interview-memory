import { z } from 'zod'

const nonnegativeInteger = z.number().int().nonnegative()

const personalMetaSchema = z.strictObject({
  status: z.literal('live'),
  generatedAt: z.string(),
  submissionsCount: nonnegativeInteger,
  searchEpisodesCount: nonnegativeInteger,
  companyExperiencesCount: nonnegativeInteger,
  applicationsCount: nonnegativeInteger,
})

const searchSummarySchema = z.strictObject({
  episodeCount: nonnegativeInteger,
  applicationsCount: nonnegativeInteger,
  humanResponsesCount: nonnegativeInteger,
  interviewsCount: nonnegativeInteger,
  offersCount: nonnegativeInteger,
  employmentStartedCount: nonnegativeInteger,
})

const companyExperienceSchema = z.strictObject({
  company: z.string().min(1),
  role: z.string().min(1),
  processYear: z.number().int(),
  promisedTimeline: z.string(),
  promisedDays: z.number().int().nullable(),
  actualDays: z.number().int().nullable(),
  wasGhosted: z.boolean(),
  ghostedAfterStage: z.string().nullable(),
  rejectionShared: z.string(),
  feedbackUseful: z.number().int().nullable(),
  processTransparency: z.number().int(),
  hrProfessionalism: z.number().int(),
  wouldRecommendProcess: z.string(),
  createdAt: z.string(),
})

const applicationSchema = z.strictObject({
  company: z.string().min(1),
  role: z.string().min(1),
  applicationChannel: z.string(),
  hadReferral: z.boolean(),
  appliedMonth: z.string(),
  outcome: z.string().nullable(),
  outcomeMonth: z.string().nullable(),
  stageCount: nonnegativeInteger,
  createdAt: z.string(),
})

export const personalBenchmarkReportSchema = z.strictObject({
  meta: personalMetaSchema,
  search: searchSummarySchema,
  companyExperiences: z.array(companyExperienceSchema),
  applications: z.array(applicationSchema),
})

export type PersonalBenchmarkReport = z.infer<
  typeof personalBenchmarkReportSchema
>
