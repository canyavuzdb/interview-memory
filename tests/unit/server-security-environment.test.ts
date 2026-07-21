import { afterEach, describe, expect, it, vi } from 'vitest'

import { getServerSecurityEnvironment } from '@/lib/env/server'

const active = Buffer.alloc(32, 1).toString('base64url')
const previous = Buffer.alloc(32, 2).toString('base64url')
const quota = Buffer.alloc(32, 3).toString('base64url')
const idempotency = Buffer.alloc(32, 4).toString('base64url')

function configureRequiredEnvironment() {
  vi.stubEnv('RESPONDENT_HMAC_ACTIVE_KEY_VERSION', '2')
  vi.stubEnv('RESPONDENT_HMAC_ACTIVE_KEY', active)
  vi.stubEnv('QUOTA_SUBJECT_HMAC_KEY', quota)
  vi.stubEnv('IDEMPOTENCY_HMAC_KEY', idempotency)
}

afterEach(() => vi.unstubAllEnvs())

describe('server security environment', () => {
  it('loads an active-only key ring', () => {
    configureRequiredEnvironment()
    vi.stubEnv('RESPONDENT_HMAC_PREVIOUS_KEY_VERSION', '')
    vi.stubEnv('RESPONDENT_HMAC_PREVIOUS_KEY', '')

    expect(getServerSecurityEnvironment()).toEqual({
      respondentKeys: {
        active: { version: 2, secret: active },
        previous: null,
      },
      quotaSubjectKey: quota,
      idempotencyKey: idempotency,
    })
  })

  it('loads active and previous keys as a rotation pair', () => {
    configureRequiredEnvironment()
    vi.stubEnv('RESPONDENT_HMAC_PREVIOUS_KEY_VERSION', '1')
    vi.stubEnv('RESPONDENT_HMAC_PREVIOUS_KEY', previous)

    expect(getServerSecurityEnvironment().respondentKeys.previous).toEqual({
      version: 1,
      secret: previous,
    })
  })

  it('requires the previous key and version together', () => {
    configureRequiredEnvironment()
    vi.stubEnv('RESPONDENT_HMAC_PREVIOUS_KEY_VERSION', '1')
    vi.stubEnv('RESPONDENT_HMAC_PREVIOUS_KEY', '')

    expect(getServerSecurityEnvironment).toThrow(
      'Previous respondent HMAC key and version must be configured together',
    )
  })

  it('requires distinct active and previous versions', () => {
    configureRequiredEnvironment()
    vi.stubEnv('RESPONDENT_HMAC_PREVIOUS_KEY_VERSION', '2')
    vi.stubEnv('RESPONDENT_HMAC_PREVIOUS_KEY', previous)

    expect(getServerSecurityEnvironment).toThrow(
      'Respondent HMAC key versions must be distinct',
    )
  })
})
