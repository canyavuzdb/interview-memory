import { z } from 'zod'

const nonnegativeInteger = z.number().int().nonnegative()
const monthSchema = z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/u)
const cohortStatusSchema = z.enum(['live', 'collecting', 'unavailable'])

const monthlyCountSchema = z.strictObject({
  month: monthSchema,
  count: z.number().nonnegative(),
})

const reportMetaSchema = z.strictObject({
  status: cohortStatusSchema,
  generatedAt: z.iso.date(),
  periodStart: monthSchema,
  periodEnd: monthSchema,
  region: z.string().min(1).max(40),
  recordCount: nonnegativeInteger,
  uniqueCandidates: nonnegativeInteger,
  minPublicCohortSize: z.number().int().min(1).max(100),
  minSalarySampleSize: z.number().int().min(1).max(100),
})

export const roleRowSchema = z.strictObject({
  id: z.string().min(1).max(260),
  roleFamily: z.string().min(1).max(80),
  roleSpecialization: z.string().min(1).max(120),
  seniority: z.enum(['intern', 'junior', 'mid', 'senior', 'lead_manager']),
  uniqueCandidates: nonnegativeInteger,
  matureSearchEpisodesCount: nonnegativeInteger,
  applicationsCount: nonnegativeInteger,
  monthlyAverageApplications: z.number().nonnegative(),
  responsesCount: nonnegativeInteger,
  interviewsCount: nonnegativeInteger,
  offersCount: nonnegativeInteger,
  employmentStartedCount: nonnegativeInteger,
  monthlyApplications: z.array(monthlyCountSchema).min(3).max(12),
})

export const publicRoleBenchmarkReportSchema = z.strictObject({
  roleCohortCount: nonnegativeInteger,
  roleMonthly: z.array(roleRowSchema),
})

export type PublicRoleBenchmarkReport = z.infer<
  typeof publicRoleBenchmarkReportSchema
>

const salarySchema = z.strictObject({
  min: nonnegativeInteger,
  max: nonnegativeInteger.nullable(),
  currency: z.string().length(3),
})

const companyFunnelRowSchema = z.strictObject({
  id: z.string().min(1).max(120),
  company: z.string().min(1).max(200),
  uniqueCandidates: nonnegativeInteger,
  applicationsCount: nonnegativeInteger,
  responsesCount: nonnegativeInteger,
  interviewsCount: nonnegativeInteger,
  offersCount: nonnegativeInteger,
  employmentStartedCount: nonnegativeInteger,
  acceptedSalarySampleSize: nonnegativeInteger,
  medianAcceptedSalary: salarySchema,
  monthlyApplications: z.array(nonnegativeInteger).min(3).max(12),
})

const candidateCellSchema = z.strictObject({
  paceBand: z.enum([
    'under_five',
    'five_to_nine',
    'ten_to_nineteen',
    'twenty_plus',
  ]),
  episodeCount: nonnegativeInteger,
  applicationsCount: nonnegativeInteger,
  responsesCount: nonnegativeInteger,
  offersCount: nonnegativeInteger,
})

const candidateTempoSchema = z.strictObject({
  rows: z.array(z.strictObject({
    durationBand: z.enum([
      'one_month',
      'two_to_three_months',
      'four_to_six_months',
      'seven_plus_months',
    ]),
    cells: z.array(candidateCellSchema).length(4),
  })).max(4),
})

const companyTempoCellSchema = z.strictObject({
  actualBand: z.enum([
    'zero_to_three',
    'four_to_seven',
    'eight_to_fourteen',
    'fifteen_to_thirty',
    'over_thirty',
    'reported_no_response',
  ]),
  count: nonnegativeInteger,
})

const companyResponseTempoSchema = z.strictObject({
  rows: z.array(z.strictObject({
    promisedBand: z.enum([
      'not_provided',
      'zero_to_three',
      'four_to_seven',
      'eight_to_fourteen',
      'fifteen_plus',
    ]),
    eligibleCount: nonnegativeInteger,
    cells: z.array(companyTempoCellSchema).length(6),
  })).max(5),
})

const activityTimingSchema = z.strictObject({
  meta: z.strictObject({
    status: cohortStatusSchema,
    period: z.string().regex(/^rolling_(?:[3-9]|1[0-2])_months$/u),
    source: z.literal('candidate_reported_aggregate'),
    metricDefinitionVersion: z.string().regex(/^\d+\.\d+$/u),
    minimumPublicSample: z.number().int().min(1).max(100),
  }),
  candidateTempo: candidateTempoSchema,
  companyResponseTempo: companyResponseTempoSchema,
})

const responsivenessMetaSchema = z.strictObject({
  responseWindowDays: z.number().int().positive().max(365),
  period: z.string().regex(/^rolling_(?:[3-9]|1[0-2])_months$/u),
  source: z.literal('candidate_reported_aggregate'),
  metricDefinitionVersion: z.string().regex(/^\d+\.\d+$/u),
})

const responsivenessRowSchema = z.strictObject({
  id: z.string().min(1).max(120),
  company: z.string().min(1).max(200),
  eligibleMatureApplicationsCount: nonnegativeInteger,
  noSubstantiveUpdateCount: nonnegativeInteger,
  interviewedApplicationsCount: nonnegativeInteger,
  postInterviewNoFollowUpCount: nonnegativeInteger,
  contributorsCount: nonnegativeInteger,
})

export const publicBenchmarkReportSchema = z.strictObject({
  meta: reportMetaSchema,
  roleCohortCount: nonnegativeInteger.optional().default(0),
  roleMonthly: z.array(roleRowSchema),
  companyFunnel: z.array(companyFunnelRowSchema),
  activityTiming: activityTimingSchema,
  companyResponsivenessMeta: responsivenessMetaSchema,
  companyResponsiveness: z.array(responsivenessRowSchema),
})

export type PublicBenchmarkReport = z.infer<
  typeof publicBenchmarkReportSchema
>

export function createEmptyPublicBenchmarkReport(
  status: 'collecting' | 'unavailable',
  now = new Date(),
): PublicBenchmarkReport {
  const periodEnd = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    1,
  ))
  const periodStart = new Date(Date.UTC(
    periodEnd.getUTCFullYear(),
    periodEnd.getUTCMonth() - 5,
    1,
  ))
  const month = (value: Date) => value.toISOString().slice(0, 7)

  return {
    meta: {
      status,
      generatedAt: now.toISOString().slice(0, 10),
      periodStart: month(periodStart),
      periodEnd: month(periodEnd),
      region: 'all',
      recordCount: 0,
      uniqueCandidates: 0,
      minPublicCohortSize: 1,
      minSalarySampleSize: 1,
    },
    roleCohortCount: 0,
    roleMonthly: [],
    companyFunnel: [],
    activityTiming: {
      meta: {
        status,
        period: 'rolling_6_months',
        source: 'candidate_reported_aggregate',
        metricDefinitionVersion: '3.0',
        minimumPublicSample: 1,
      },
      candidateTempo: { rows: [] },
      companyResponseTempo: { rows: [] },
    },
    companyResponsivenessMeta: {
      responseWindowDays: 30,
      period: 'rolling_6_months',
      source: 'candidate_reported_aggregate',
      metricDefinitionVersion: '2.0',
    },
    companyResponsiveness: [],
  }
}
