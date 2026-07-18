import { describe, expect, it } from 'vitest'

import {
  consentReceiptDtoSchema,
  currentNoticeQuerySchema,
  recordConsentCommandSchema,
} from '@/lib/privacy/contracts'

const noticeVersionId = '11111111-1111-4111-8111-111111111111'
const idempotencyKey = '22222222-2222-4222-8222-222222222222'

describe('privacy API contracts', () => {
  it('accepts a supported current-notice query', () => {
    expect(
      currentNoticeQuerySchema.parse({
        documentType: 'survey_notice',
        locale: 'tr',
      }),
    ).toEqual({
      documentType: 'survey_notice',
      locale: 'tr',
    })
  })

  it.each([
    {
      documentType: 'survey_notice',
      locale: 'de',
    },
    {
      documentType: 'survey_notice',
      locale: 'tr',
      userId: 'not-allowed',
    },
  ])('rejects unsupported or server-owned notice query data', (input) => {
    expect(() => currentNoticeQuerySchema.parse(input)).toThrow()
  })

  it('accepts only the public consent command fields', () => {
    expect(
      recordConsentCommandSchema.parse({
        noticeVersionId,
        purposeCode: 'survey_contribution',
        decision: 'granted',
        idempotencyKey,
      }),
    ).toEqual({
      noticeVersionId,
      purposeCode: 'survey_contribution',
      decision: 'granted',
      idempotencyKey,
    })
  })

  it.each([
    { authUserId: '33333333-3333-4333-8333-333333333333' },
    { ip: '192.0.2.1' },
    { userAgent: 'synthetic-browser' },
    { deviceFingerprint: 'not-collected' },
    { occurredAt: '2026-07-18T12:00:00.000Z' },
  ])('rejects a server-owned or tracking field: %o', (injectedField) => {
    expect(() =>
      recordConsentCommandSchema.parse({
        noticeVersionId,
        purposeCode: 'survey_contribution',
        decision: 'granted',
        idempotencyKey,
        ...injectedField,
      }),
    ).toThrow()
  })

  it.each([
    { noticeVersionId: 'not-a-uuid' },
    { purposeCode: 'advertising' },
    { decision: 'accepted' },
    { decision: 'withdrawn' },
    { idempotencyKey: 'stable-device-id' },
  ])('rejects an invalid consent command value: %o', (replacement) => {
    expect(() =>
      recordConsentCommandSchema.parse({
        noticeVersionId,
        purposeCode: 'survey_contribution',
        decision: 'granted',
        idempotencyKey,
        ...replacement,
      }),
    ).toThrow()
  })

  it('validates the minimum consent receipt DTO', () => {
    expect(
      consentReceiptDtoSchema.parse({
        eventId: '44444444-4444-4444-8444-444444444444',
        createdAt: '2026-07-18T12:00:00.000Z',
        replayed: false,
      }),
    ).toEqual({
      eventId: '44444444-4444-4444-8444-444444444444',
      createdAt: '2026-07-18T12:00:00.000Z',
      replayed: false,
    })
  })
})
