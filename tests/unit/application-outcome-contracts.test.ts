import { describe, expect, it } from 'vitest'

import { applicationOutcomeFollowUpBodySchema } from '@/lib/application-outcome/contracts'

describe('application outcome contracts', () => {
  it.each([
    {
      outcome: 'interviewing',
      occurredMonth: null,
      plannedStartMonth: null,
    },
    {
      outcome: 'offer_accepted',
      occurredMonth: '2026-07',
      plannedStartMonth: '2026-08',
    },
  ])('accepts coherent follow-up %#', (body) => {
    expect(applicationOutcomeFollowUpBodySchema.safeParse(body).success).toBe(
      true,
    )
  })

  it.each([
    {
      outcome: 'interviewing',
      occurredMonth: '2026-07',
      plannedStartMonth: null,
    },
    {
      outcome: 'manual_rejection',
      occurredMonth: null,
      plannedStartMonth: null,
    },
    {
      outcome: 'manual_rejection',
      occurredMonth: '2026-07',
      plannedStartMonth: '2026-08',
    },
  ])('rejects incoherent follow-up %#', (body) => {
    expect(applicationOutcomeFollowUpBodySchema.safeParse(body).success).toBe(
      false,
    )
  })
})
