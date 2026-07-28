'use client'

import { useCallback, useEffect, useState } from 'react'

function storageKey(survey) {
  return `interview-memory:survey-quota:${survey}`
}

function cacheQuota(survey, quota) {
  if (typeof window === 'undefined') return

  try {
    if (quota.mode === 'anonymous') {
      window.sessionStorage.setItem(storageKey(survey), JSON.stringify(quota))
    } else {
      window.sessionStorage.removeItem(storageKey(survey))
    }
  } catch {}
}

export default function SurveyQuotaNotice({ copy, survey }) {
  // Keep the initial render identical on the server and client. Browser storage
  // is populated after hydration so it must not be read in a state initializer.
  const [quota, setQuota] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshQuota = useCallback(() => {
    fetch(`/api/v1/survey-quota?survey=${survey}`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((response) => {
        if (response?.data) {
          cacheQuota(survey, response.data)
          setQuota(response.data)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [survey])

  useEffect(() => {
    const onQuotaUpdated = (event) => {
      if (event.detail?.survey === survey) refreshQuota()
    }

    refreshQuota()
    window.addEventListener('survey-quota-updated', onQuotaUpdated)
    return () => {
      window.removeEventListener('survey-quota-updated', onQuotaUpdated)
    }
  }, [refreshQuota, survey])

  if (quota?.mode === 'authenticated') {
    return (
      <div className="mt-7 border-l-2 border-accent bg-surface px-4 py-3 text-sm leading-6 text-muted">
        <p className="font-semibold text-ink">{copy.memberTitle}</p>
        <p className="mt-1">{copy.memberDescription}</p>
      </div>
    )
  }

  const limit = quota?.limit ?? 3
  const remaining = quota?.remaining ?? 0

  return (
    <div className="mt-7 border-l-2 border-accent bg-surface px-4 py-3 text-sm leading-6 text-muted">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-semibold text-ink">{copy.anonymousTitle}</p>
        <p className="font-mono text-xs font-bold tracking-[0.08em] text-accentDark">
          {isLoading ? '…' : quota ? `${remaining} / ${limit}` : `— / ${limit}`}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5" aria-label={`${remaining} / ${limit}`}>
        {Array.from({ length: limit }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 border border-[var(--accent-border)] ${!isLoading && index < remaining ? 'bg-accent' : 'bg-transparent'}`}
          />
        ))}
      </div>
      <p className="mt-1">
        {isLoading
          ? copy.loading
          : !quota
          ? copy.available.replace('{limit}', String(limit))
          : remaining === 0
          ? copy.exhausted
          : copy.remaining
              .replace('{remaining}', String(remaining))
              .replace('{limit}', String(limit))}
      </p>
    </div>
  )
}
