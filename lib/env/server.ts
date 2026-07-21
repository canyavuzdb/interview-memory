import 'server-only'

import {
  requireBase64UrlSecret,
  requirePositiveInteger,
  requireSupabaseSecretKey,
} from '@/lib/env/validation'

export function getServerSupabaseEnvironment() {
  return {
    secretKey: requireSupabaseSecretKey(
      process.env.SUPABASE_SECRET_KEY,
      'SUPABASE_SECRET_KEY',
    ),
  }
}

export function getServerSecurityEnvironment() {
  const previousKey = process.env.RESPONDENT_HMAC_PREVIOUS_KEY?.trim()
  const previousVersion =
    process.env.RESPONDENT_HMAC_PREVIOUS_KEY_VERSION?.trim()

  if (Boolean(previousKey) !== Boolean(previousVersion)) {
    throw new Error(
      'Previous respondent HMAC key and version must be configured together',
    )
  }

  const activeVersion = requirePositiveInteger(
    process.env.RESPONDENT_HMAC_ACTIVE_KEY_VERSION,
    'RESPONDENT_HMAC_ACTIVE_KEY_VERSION',
  )
  const parsedPreviousVersion = previousVersion
    ? requirePositiveInteger(
        previousVersion,
        'RESPONDENT_HMAC_PREVIOUS_KEY_VERSION',
      )
    : null

  if (parsedPreviousVersion === activeVersion) {
    throw new Error('Respondent HMAC key versions must be distinct')
  }

  return {
    respondentKeys: {
      active: {
        version: activeVersion,
        secret: requireBase64UrlSecret(
          process.env.RESPONDENT_HMAC_ACTIVE_KEY,
          'RESPONDENT_HMAC_ACTIVE_KEY',
        ),
      },
      previous:
        previousKey && parsedPreviousVersion
          ? {
              version: parsedPreviousVersion,
              secret: requireBase64UrlSecret(
                previousKey,
                'RESPONDENT_HMAC_PREVIOUS_KEY',
              ),
            }
          : null,
    },
    quotaSubjectKey: requireBase64UrlSecret(
      process.env.QUOTA_SUBJECT_HMAC_KEY,
      'QUOTA_SUBJECT_HMAC_KEY',
    ),
    idempotencyKey: requireBase64UrlSecret(
      process.env.IDEMPOTENCY_HMAC_KEY,
      'IDEMPOTENCY_HMAC_KEY',
    ),
  }
}

export function getServerIntakeEnvironment() {
  const previousKey = process.env.SUBMISSION_CAPABILITY_HMAC_PREVIOUS_KEY?.trim()
  const previousVersion =
    process.env.SUBMISSION_CAPABILITY_HMAC_PREVIOUS_KEY_VERSION?.trim()

  if (Boolean(previousKey) !== Boolean(previousVersion)) {
    throw new Error(
      'Previous submission capability HMAC key and version must be configured together',
    )
  }

  const activeVersion = requirePositiveInteger(
    process.env.SUBMISSION_CAPABILITY_HMAC_ACTIVE_KEY_VERSION,
    'SUBMISSION_CAPABILITY_HMAC_ACTIVE_KEY_VERSION',
  )
  const parsedPreviousVersion = previousVersion
    ? requirePositiveInteger(
        previousVersion,
        'SUBMISSION_CAPABILITY_HMAC_PREVIOUS_KEY_VERSION',
      )
    : null

  if (parsedPreviousVersion === activeVersion) {
    throw new Error('Submission capability HMAC key versions must be distinct')
  }

  return {
    capabilityKeys: {
      active: {
        version: activeVersion,
        secret: requireBase64UrlSecret(
          process.env.SUBMISSION_CAPABILITY_HMAC_ACTIVE_KEY,
          'SUBMISSION_CAPABILITY_HMAC_ACTIVE_KEY',
        ),
      },
      previous:
        previousKey && parsedPreviousVersion
          ? {
              version: parsedPreviousVersion,
              secret: requireBase64UrlSecret(
                previousKey,
                'SUBMISSION_CAPABILITY_HMAC_PREVIOUS_KEY',
              ),
            }
          : null,
    },
  }
}
