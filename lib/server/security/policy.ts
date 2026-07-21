import 'server-only'

import policyDocument from '@/config/security/quota-policies.v1.json'
import {
  quotaPolicyDocumentSchema,
  type QuotaPolicyDocument,
} from '@/lib/security/contracts'
import { SecurityServiceError } from '@/lib/security/errors'
import { sha256Value } from '@/lib/server/security/crypto'

let cachedPolicy:
  | { document: QuotaPolicyDocument; hash: string }
  | undefined

export function parseQuotaPolicy(document: unknown) {
  const result = quotaPolicyDocumentSchema.safeParse(document)

  if (!result.success) {
    throw new SecurityServiceError('QUOTA_POLICY_INVALID')
  }

  return {
    document: result.data,
    hash: sha256Value(result.data),
  }
}

export function loadQuotaPolicy() {
  if (cachedPolicy) return cachedPolicy

  cachedPolicy = parseQuotaPolicy(policyDocument)

  return cachedPolicy
}
