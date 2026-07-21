import { z } from 'zod'

const submissionResponseSchema = z.strictObject({
  data: z.strictObject({
    receiptId: z.uuid(),
    searchEpisodeId: z.uuid(),
    submissionCapability: z
      .string()
      .regex(/^[A-Za-z0-9_-]{43}$/u)
      .nullable(),
    replayed: z.boolean(),
  }),
})

export async function submitApplicationBenchmark(
  formData,
  idempotencyKey = globalThis.crypto.randomUUID(),
) {
  try {
    const response = await fetch('/api/v1/search-episodes', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(formData),
    })

    if (response.status !== 201) return { success: false }

    const parsed = submissionResponseSchema.safeParse(await response.json())
    if (!parsed.success) return { success: false }

    return {
      success: true,
      id: parsed.data.data.receiptId,
      receiptId: parsed.data.data.receiptId,
      searchEpisodeId: parsed.data.data.searchEpisodeId,
      submissionCapability: parsed.data.data.submissionCapability,
      replayed: parsed.data.data.replayed,
    }
  } catch {
    return { success: false }
  }
}
