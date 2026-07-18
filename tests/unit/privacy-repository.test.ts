import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PrivacyPersistenceError } from '@/lib/privacy/errors'
import { createSupabasePrivacyRepository } from '@/lib/server/privacy/repository'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: vi.fn(),
}))

const timestamp = '2026-07-18T12:00:00.000Z'
const userId = '11111111-1111-4111-8111-111111111111'
const noticeId = '22222222-2222-4222-8222-222222222222'
const eventId = '33333333-3333-4333-8333-333333333333'
const idempotencyKey = '44444444-4444-4444-8444-444444444444'
const sha256Bytea = `\\x${'ab'.repeat(32)}`
const rpc = vi.fn()

const consentCommand = {
  authUserId: userId,
  noticeVersionId: noticeId,
  purposeCode: 'survey_contribution',
  decision: 'granted',
  eventSource: 'survey',
  subjectProofHmac: sha256Bytea,
  subjectProofKeyVersion: 1,
  idempotencyKey,
}

beforeEach(() => {
  vi.mocked(createAdminSupabaseClient).mockReturnValue({
    rpc,
  } as never)
})

describe('Supabase privacy repository', () => {
  it('reads and validates the current notice response', async () => {
    const row = {
      id: noticeId,
      document_type: 'survey_notice',
      locale: 'tr',
      version: '2026-07-18',
      content_sha256: sha256Bytea,
      content_uri: '/privacy/survey/2026-07-18.tr.md',
      effective_from: timestamp,
    }
    rpc.mockResolvedValue({ data: [row], error: null })

    await expect(
      createSupabasePrivacyRepository().getCurrentNotice({
        documentType: 'survey_notice',
        locale: 'tr',
      }),
    ).resolves.toEqual(row)
    expect(rpc).toHaveBeenCalledWith('get_current_notice_v1', {
      p_document_type: 'survey_notice',
      p_locale: 'tr',
    })
  })

  it('returns null when there is no current notice', async () => {
    rpc.mockResolvedValue({ data: [], error: null })

    await expect(
      createSupabasePrivacyRepository().getCurrentNotice({
        documentType: 'account_notice',
        locale: 'en',
      }),
    ).resolves.toBeNull()
  })

  it('maps current-notice database and response failures', async () => {
    rpc
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'database unavailable' },
      })
      .mockResolvedValueOnce({
        data: [{ id: 'invalid' }],
        error: null,
      })
    const repository = createSupabasePrivacyRepository()

    await expect(
      repository.getCurrentNotice({
        documentType: 'survey_notice',
        locale: 'tr',
      }),
    ).rejects.toEqual(new PrivacyPersistenceError('NOTICE_READ_FAILED'))
    await expect(
      repository.getCurrentNotice({
        documentType: 'survey_notice',
        locale: 'tr',
      }),
    ).rejects.toEqual(new PrivacyPersistenceError('NOTICE_RESPONSE_INVALID'))
  })

  it('writes consent through the narrow generated RPC contract', async () => {
    const receipt = {
      event_id: eventId,
      event_created_at: timestamp,
      replayed: false,
    }
    rpc.mockResolvedValue({ data: [receipt], error: null })

    await expect(
      createSupabasePrivacyRepository().recordAuthenticatedConsent(
        consentCommand,
      ),
    ).resolves.toEqual(receipt)
    expect(rpc).toHaveBeenCalledWith('record_authenticated_consent_v1', {
      p_auth_user_id: userId,
      p_decision: 'granted',
      p_event_source: 'survey',
      p_idempotency_key: idempotencyKey,
      p_notice_version_id: noticeId,
      p_purpose_code: 'survey_contribution',
      p_subject_proof_hmac: sha256Bytea,
      p_subject_proof_key_version: 1,
    })
  })

  it.each([
    ['active_data_subject_not_found', 'CONSENT_SUBJECT_NOT_FOUND'],
    ['auth_user_required', 'CONSENT_SUBJECT_NOT_FOUND'],
    ['notice_version_not_effective', 'CONSENT_NOTICE_NOT_EFFECTIVE'],
    ['notice_purpose_mismatch', 'CONSENT_NOTICE_PURPOSE_MISMATCH'],
    ['idempotency_key_reused', 'CONSENT_IDEMPOTENCY_CONFLICT'],
    ['unexpected_database_error', 'CONSENT_WRITE_FAILED'],
  ] as const)(
    'maps consent database error %s to %s',
    async (message, expectedCode) => {
      rpc.mockResolvedValue({
        data: null,
        error: { message },
      })

      await expect(
        createSupabasePrivacyRepository().recordAuthenticatedConsent(
          consentCommand,
        ),
      ).rejects.toEqual(new PrivacyPersistenceError(expectedCode))
    },
  )

  it('rejects a malformed consent receipt', async () => {
    rpc.mockResolvedValue({
      data: [{ event_id: 'invalid' }],
      error: null,
    })

    await expect(
      createSupabasePrivacyRepository().recordAuthenticatedConsent(
        consentCommand,
      ),
    ).rejects.toEqual(
      new PrivacyPersistenceError('CONSENT_RESPONSE_INVALID'),
    )
  })
})
