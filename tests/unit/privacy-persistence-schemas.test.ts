import { describe, expect, it } from 'vitest'

import {
  consentEventRowSchema,
  createNoticeVersionCommandSchema,
  dataSubjectRowSchema,
  noticeVersionRowSchema,
  updateOwnProfileCommandSchema,
  userProfileRowSchema,
  userRoleAssignmentRowSchema,
} from '@/lib/server/privacy/persistence.schemas'

const timestamp = '2026-07-18T12:00:00.000Z'
const userId = '11111111-1111-4111-8111-111111111111'
const subjectId = '22222222-2222-4222-8222-222222222222'
const noticeId = '33333333-3333-4333-8333-333333333333'
const eventId = '44444444-4444-4444-8444-444444444444'
const idempotencyKey = '55555555-5555-4555-8555-555555555555'
const sha256Bytea = `\\x${'ab'.repeat(32)}`

describe('privacy persistence schemas', () => {
  it('validates a generated user-profile row shape', () => {
    expect(
      userProfileRowSchema.parse({
        user_id: userId,
        display_name: null,
        avatar_url: null,
        locale: 'tr',
        timezone: 'Europe/Istanbul',
        onboarding_status: 'pending',
        account_status: 'active',
        version: 1,
        created_at: timestamp,
        updated_at: timestamp,
      }),
    ).toMatchObject({
      user_id: userId,
      locale: 'tr',
      account_status: 'active',
    })
  })

  it('validates authenticated and anonymous data-subject row shapes', () => {
    expect(
      dataSubjectRowSchema.parse({
        id: subjectId,
        auth_user_id: userId,
        anonymous_key_hmac: null,
        anonymous_key_version: null,
        status: 'authenticated',
        merged_into_id: null,
        created_at: timestamp,
        deleted_at: null,
      }),
    ).toMatchObject({
      id: subjectId,
      status: 'authenticated',
    })

    expect(
      dataSubjectRowSchema.parse({
        id: subjectId,
        auth_user_id: null,
        anonymous_key_hmac: sha256Bytea,
        anonymous_key_version: 1,
        status: 'anonymous',
        merged_into_id: null,
        created_at: timestamp,
        deleted_at: null,
      }),
    ).toMatchObject({
      anonymous_key_version: 1,
      status: 'anonymous',
    })
  })

  it('keeps profile updates on an explicit mutable allowlist', () => {
    expect(
      updateOwnProfileCommandSchema.parse({
        displayName: 'Ada',
        expectedVersion: 2,
      }),
    ).toEqual({
      displayName: 'Ada',
      expectedVersion: 2,
    })

    expect(() =>
      updateOwnProfileCommandSchema.parse({ expectedVersion: 2 }),
    ).toThrow('At least one profile field must be provided')

    expect(() =>
      updateOwnProfileCommandSchema.parse({
        accountStatus: 'active',
        expectedVersion: 2,
      }),
    ).toThrow()
  })

  it('validates role audit history against generated row types', () => {
    expect(
      userRoleAssignmentRowSchema.parse({
        id: eventId,
        user_id: userId,
        role_code: 'privacy_operator',
        granted_by_user_id: null,
        subject_audit_principal: sha256Bytea,
        grantor_role_snapshot: 'bootstrap_operator',
        reason_code: 'privacy_operations',
        granted_at: timestamp,
        revoked_at: null,
      }),
    ).toMatchObject({
      role_code: 'privacy_operator',
      reason_code: 'privacy_operations',
    })
  })

  it('validates immutable notice-version rows', () => {
    expect(
      noticeVersionRowSchema.parse({
        id: noticeId,
        document_type: 'survey_notice',
        locale: 'tr',
        version: '2026-07-18',
        content_sha256: sha256Bytea,
        content_uri: '/privacy/survey/2026-07-18.tr.md',
        effective_from: timestamp,
        retired_at: null,
        created_at: timestamp,
      }),
    ).toMatchObject({
      id: noticeId,
      document_type: 'survey_notice',
    })
  })

  it('does not allow callers to set notice identity or lifecycle fields', () => {
    const command = {
      documentType: 'survey_notice',
      locale: 'tr',
      version: '2026-07-18',
      contentSha256: sha256Bytea,
      contentUri: '/privacy/survey/2026-07-18.tr.md',
      effectiveFrom: timestamp,
    }

    expect(createNoticeVersionCommandSchema.parse(command)).toEqual(command)
    expect(() =>
      createNoticeVersionCommandSchema.parse({
        ...command,
        id: noticeId,
      }),
    ).toThrow()
    expect(() =>
      createNoticeVersionCommandSchema.parse({
        ...command,
        retiredAt: timestamp,
      }),
    ).toThrow()
  })

  it('validates append-only consent rows without tracking identifiers', () => {
    const row = {
      id: eventId,
      data_subject_id: subjectId,
      subject_proof_hmac: sha256Bytea,
      subject_proof_key_version: 1,
      notice_version_id: noticeId,
      submission_id: null,
      purpose_code: 'survey_contribution',
      decision: 'granted',
      event_source: 'survey',
      idempotency_key: idempotencyKey,
      occurred_at: timestamp,
      created_at: timestamp,
    }

    expect(consentEventRowSchema.parse(row)).toEqual(row)
    expect(
      consentEventRowSchema.parse({
        ...row,
        decision: 'withdrawn',
      }).decision,
    ).toBe('withdrawn')
    expect(() =>
      consentEventRowSchema.parse({
        ...row,
        ip_hmac: sha256Bytea,
      }),
    ).toThrow()
  })
})
