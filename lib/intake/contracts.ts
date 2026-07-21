import { z } from 'zod'

export const surveyTypes = ['search_benchmark', 'company_experience'] as const
export const submissionLifecycleStatuses = [
  'accepted',
  'withdrawn',
  'superseded',
] as const
export const submissionQualityStatuses = [
  'pending',
  'eligible',
  'excluded',
] as const

export const submissionReceiptQuerySchema = z.strictObject({
  receiptId: z.uuid(),
  authorization: z.string().max(512).nullable(),
  requesterDataSubjectId: z.uuid().nullable(),
})

export const submissionReceiptDtoSchema = z.strictObject({
  receiptId: z.uuid(),
  surveyType: z.enum(surveyTypes),
  lifecycleStatus: z.enum(submissionLifecycleStatuses),
  qualityStatus: z.enum(submissionQualityStatuses),
  submittedAt: z.iso.datetime({ offset: true }),
  withdrawnAt: z.iso.datetime({ offset: true }).nullable(),
})

export type SubmissionReceiptDto = z.infer<typeof submissionReceiptDtoSchema>
