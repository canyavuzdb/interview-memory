import { describe, expect, it, vi } from 'vitest'

import { createAuthIntakeBridge } from '@/lib/server/auth/intake-bridge'
import { RESPONDENT_COOKIE_NAME } from '@/lib/server/security/respondent'

const authUserId = '11111111-1111-4111-8111-111111111111'
const anonymousSubjectId = '22222222-2222-4222-8222-222222222222'
const authenticatedSubjectId = '33333333-3333-4333-8333-333333333333'
const token = 'a'.repeat(43)
const activeSecret = Buffer.alloc(32, 1).toString('base64url')
const previousSecret = Buffer.alloc(32, 2).toString('base64url')

function setup(
  cookieValue: string | null = token,
  withPreviousKey = true,
) {
  const cookieStore = {
    get: vi.fn().mockReturnValue(
      cookieValue === null ? undefined : { value: cookieValue },
    ),
    set: vi.fn(),
    delete: vi.fn(),
  }
  const repository = {
    resolveAuthenticatedSubject: vi.fn().mockResolvedValue(
      authenticatedSubjectId,
    ),
    mergeAnonymousSubject: vi.fn().mockResolvedValue({
      data_subject_id: authenticatedSubjectId,
      merged: true,
    }),
  }
  const resolveAccount = vi.fn().mockResolvedValue({ userId: authUserId })
  const resolveAnonymous = vi.fn().mockResolvedValue({
    dataSubjectId: anonymousSubjectId,
    created: false,
    keyRotated: false,
  })
  const bridge = createAuthIntakeBridge({
    cookieStore,
    repository,
    respondentKeys: {
      active: { version: 2, secret: activeSecret },
      previous: withPreviousKey
        ? { version: 1, secret: previousSecret }
        : null,
    },
    quotaSubjectKey: activeSecret,
    resolveAccount: resolveAccount as never,
    resolveAnonymous: resolveAnonymous as never,
  })
  return {
    bridge,
    cookieStore,
    repository,
    resolveAccount,
    resolveAnonymous,
  }
}

describe('auth intake bridge', () => {
  it('moves anonymous ownership and clears the unlinkable cookie', async () => {
    const subject = setup()

    await expect(subject.bridge.reconcile()).resolves.toBe('merged')
    expect(subject.repository.mergeAnonymousSubject).toHaveBeenCalledWith({
      authUserId,
      activeAnonymousHmac: expect.stringMatching(/^\\x[0-9a-f]{64}$/u),
      previousAnonymousHmac: expect.stringMatching(/^\\x[0-9a-f]{64}$/u),
      anonymousQuotaSubjectHmac: expect.stringMatching(/^\\x[0-9a-f]{64}$/u),
      authenticatedQuotaSubjectHmac: expect.stringMatching(/^\\x[0-9a-f]{64}$/u),
    })
    expect(subject.cookieStore.delete).toHaveBeenCalledWith(
      RESPONDENT_COOKIE_NAME,
    )
  })

  it('uses a verified caller-provided account and reports retry-safe replay', async () => {
    const subject = setup(token, false)
    subject.repository.mergeAnonymousSubject.mockResolvedValue({
      data_subject_id: authenticatedSubjectId,
      merged: false,
    })

    await expect(subject.bridge.reconcile({ authUserId })).resolves.toBe(
      'already_reconciled',
    )
    expect(subject.resolveAccount).not.toHaveBeenCalled()
    expect(subject.repository.mergeAnonymousSubject).toHaveBeenCalledWith(
      expect.objectContaining({ previousAnonymousHmac: null }),
    )
  })

  it('skips absent and removes malformed respondent cookies', async () => {
    const absent = setup(null)
    await expect(absent.bridge.reconcile()).resolves.toBe(
      'no_anonymous_cookie',
    )
    expect(absent.resolveAccount).not.toHaveBeenCalled()

    const malformed = setup('raw-cookie')
    await expect(malformed.bridge.reconcile()).resolves.toBe(
      'no_anonymous_cookie',
    )
    expect(malformed.cookieStore.delete).toHaveBeenCalledWith(
      RESPONDENT_COOKIE_NAME,
    )
  })

  it('does not touch anonymous ownership without an active account', async () => {
    const subject = setup()
    subject.resolveAccount.mockResolvedValue(null)
    await expect(subject.bridge.reconcile()).resolves.toBe('no_account')
    expect(subject.resolveAnonymous).not.toHaveBeenCalled()
    expect(subject.cookieStore.delete).not.toHaveBeenCalled()
  })

  it('keeps the cookie whenever reconciliation must be retried', async () => {
    const missingSubject = setup()
    missingSubject.repository.resolveAuthenticatedSubject.mockResolvedValue(null)
    await expect(missingSubject.bridge.reconcile()).resolves.toBe(
      'retry_pending',
    )
    expect(missingSubject.cookieStore.delete).not.toHaveBeenCalled()

    const mismatched = setup()
    mismatched.repository.mergeAnonymousSubject.mockResolvedValue({
      data_subject_id: anonymousSubjectId,
      merged: true,
    })
    await expect(mismatched.bridge.reconcile()).resolves.toBe('retry_pending')
    expect(mismatched.cookieStore.delete).not.toHaveBeenCalled()

    const failed = setup()
    failed.repository.mergeAnonymousSubject.mockRejectedValue(
      new Error('private'),
    )
    await expect(failed.bridge.reconcile()).resolves.toBe('retry_pending')
    expect(failed.cookieStore.delete).not.toHaveBeenCalled()
  })
})
