import { z } from 'zod'

export const preparationSeniorities = ['intern', 'junior', 'mid', 'senior', 'lead'] as const
export const preparationStages = ['hr_screen', 'technical', 'case_study', 'final', 'offer'] as const
export const preparationFormats = [
  'conversation', 'technical_problem', 'live_coding', 'case_study',
  'take_home', 'presentation', 'pair_programming',
] as const
export const preparationTopics = [
  'role_fundamentals', 'problem_solving', 'system_design', 'data_analysis',
  'product_thinking', 'portfolio_projects', 'domain_knowledge', 'communication', 'leadership',
] as const
export const preparationSkills = [
  'technical_depth', 'structured_thinking', 'stakeholder_management', 'business_acumen',
  'written_communication', 'english_communication', 'teamwork', 'ownership',
] as const
export const preparationQuestionTypes = [
  'technical', 'behavioral', 'case', 'company_specific', 'personal_boundary',
] as const
export const preparationQuestionOutcomes = [
  'positive_signal', 'unclear', 'needs_improvement',
] as const

const cleanText = (maximum: number) => z.string().trim().min(2).max(maximum)
const anonymizedText = z.string().trim().min(20).max(480).refine(
  (value) => !/(https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\+?\d[\d\s().-]{7,}\d)/iu.test(value),
  'Use an anonymized summary without names, contact details, links, or phone numbers.',
)
const distinct = <T extends z.ZodTypeAny>(schema: T, maximum: number) =>
  z.array(schema).min(1).max(maximum).refine((items) => new Set(items).size === items.length)

export const preparationContributionSchema = z.strictObject({
  companyName: cleanText(200),
  appliedRole: cleanText(120),
  seniority: z.enum(preparationSeniorities),
  processYear: z.int().min(2020).max(2100),
  stageDetails: z.array(z.strictObject({
    stageCode: z.enum(preparationStages),
    formatCodes: distinct(z.enum(preparationFormats), 5),
    topicCodes: distinct(z.enum(preparationTopics), 6),
    skillCodes: distinct(z.enum(preparationSkills), 5),
    questionEntries: z.array(z.strictObject({
      questionType: z.enum(preparationQuestionTypes),
      questionSummary: anonymizedText,
      answerSummary: anonymizedText,
      outcome: z.enum(preparationQuestionOutcomes),
    })).min(1).max(5),
    preparationTip: anonymizedText,
  })).min(1).max(5),
})

const aggregateSchema = z.strictObject({ code: z.string(), count: z.number().int().positive() })

export const preparationReportSchema = z.strictObject({
  status: z.enum(['live', 'insufficient']),
  sampleSize: z.number().int().nonnegative(),
  minimumSampleSize: z.number().int().positive(),
  company: z.string(),
  role: z.string(),
  seniority: z.enum(preparationSeniorities).nullable(),
  stages: z.array(aggregateSchema),
  formats: z.array(aggregateSchema),
  topics: z.array(aggregateSchema),
  skills: z.array(aggregateSchema),
  questionInsights: z.array(z.strictObject({
    questionType: z.enum(preparationQuestionTypes),
    questionSummary: z.string().min(20).max(480),
    answerSummary: z.string().min(20).max(480),
    outcome: z.enum(preparationQuestionOutcomes),
  })),
  preparationTips: z.array(z.string().min(20).max(480)),
})

export type PreparationContribution = z.infer<typeof preparationContributionSchema>
export type PreparationReport = z.infer<typeof preparationReportSchema>
