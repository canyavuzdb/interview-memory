# Anonymous abuse controls

This document defines the B06 security boundary for pseudonymous respondents,
submission quotas, and idempotent writes. The controls are backend primitives;
submission routes must compose them before accepting data.

## Identity and key rotation

- The browser receives a random 256-bit `__Host-im_respondent` cookie. It is
  `HttpOnly`, `SameSite=Lax`, path `/`, and `Secure` in production.
- Only purpose-separated HMACs are persisted. Raw cookie tokens and raw IP
  addresses are never stored by this subsystem.
- The respondent key ring has one active and, during rotation, one previous
  key. A previous-key match updates the HMAC and key version on the existing
  data subject, then reissues the same token. Rotation therefore preserves
  quota and identity history.
- Retire the previous key only after the cookie lifetime or an explicitly
  accepted retirement cutoff. Removing it sooner creates a new pseudonymous
  subject for returning browsers.
- Quota-subject and idempotency keys are separate secrets. They must not reuse
  either respondent key.

Generate each secret independently with `openssl rand -base64 32` and convert
it to unpadded base64url, or use an equivalent secret manager generator. The
runtime requires exactly 32 decoded bytes (43 base64url characters).

## Quota and idempotency

`config/security/quota-policies.v1.json` is the policy source of truth. Every
quota bucket stores the policy version and SHA-256 hash used for the decision.
The database RPC increments a bucket atomically and never lets the counter
exceed its configured limit. A denied request must be returned as HTTP `429`
with the service-provided `Retry-After` value.

Idempotency keys are HMACed and bound to the subject, operation, and canonical
request fingerprint. Reusing a key with a different payload is a conflict;
completed records can be replayed; processing records cannot run twice; failed
records may be claimed again. Route handlers must call `failIdempotency` when a
claimed operation fails before completion.

## Threat model and residual limits

| Threat | Control | Residual limitation |
| --- | --- | --- |
| Rapid repeated submissions | Atomic database quotas | Distributed bot traffic is out of the current project scope |
| Duplicate/retried writes | Database idempotency claim/complete/fail state machine | Callers must supply stable operation keys |
| Cookie database disclosure | Random opaque cookie; only HMAC stored | Browser compromise can still copy the cookie |
| HMAC key rotation | Active/previous lookup with in-place identity update | Premature previous-key retirement resets browser identity |
| Shared IP false positives | Core quotas use pseudonymous data subjects, not raw IP | Cookie deletion creates a new subject |

Cookie deletion and a fresh browser profile can bypass the pseudonymous quota.
If later evidence requires network-level throttling, add only a short-lived,
purpose-specific IP HMAC with documented TTL cleanup; never persist raw IP.
T09 is intentionally not introduced by B06 because that need is not confirmed.

## Operational checks

- Configure all six B06 environment values shown in `.env.example` for local,
  preview, and production environments.
- Keep security secrets server-only and rotate them through the deployment
  secret manager, never through public `NEXT_PUBLIC_*` variables.
- Monitor quota denial, idempotency conflict, and cleanup counts without logging
  tokens, HMAC inputs, raw IP, or request bodies.
- Regularly invoke `api.cleanup_security_ephemera_v1` from a privileged job.
- Run database tests, including the 24-request concurrency test, before merge.
