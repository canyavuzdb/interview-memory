import { z } from 'zod'

const responseSchema = z.object({ data: z.object({ id: z.uuid() }) })

export async function submitInterviewPreparation(body: unknown) {
  try {
    const response = await fetch('/api/v1/interview-preparation/contributions', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (response.status !== 201) return { success: false }
    const parsed = responseSchema.safeParse(await response.json())
    return parsed.success ? { success: true, id: parsed.data.data.id } : { success: false }
  } catch {
    return { success: false }
  }
}
