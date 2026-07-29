'use client'

import { useCallback, useEffect, useState } from 'react'

function cacheKey(survey) {
  return `im:survey-quota:${survey}`
}

export default function SurveyQuotaNotice({ copy, onQuotaChange, survey }) {
  const [quota, setQuota] = useState(null)

  const applyQuota = useCallback((nextQuota) => {
    setQuota(nextQuota)
    onQuotaChange?.(nextQuota)
  }, [onQuotaChange])

  const refreshQuota = useCallback(() => {
    fetch(`/api/v1/survey-quota?survey=${survey}`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((response) => {
        if (!response?.data) return
        applyQuota(response.data)
        window.localStorage.setItem(
          cacheKey(survey),
          JSON.stringify({ data: response.data, updatedAt: Date.now() }),
        )
      })
      .catch(() => {})
  }, [applyQuota, survey])

  useEffect(() => {
    let animationFrame
    try {
      const cached = JSON.parse(window.localStorage.getItem(cacheKey(survey)) ?? 'null')
      if (cached?.data) {
        animationFrame = window.requestAnimationFrame(() => applyQuota(cached.data))
      }
    } catch {
      window.localStorage.removeItem(cacheKey(survey))
    }

    refreshQuota()

    const onQuotaUpdated = (event) => {
      if (event.detail?.survey === survey) refreshQuota()
    }

    window.addEventListener('survey-quota-updated', onQuotaUpdated)
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('survey-quota-updated', onQuotaUpdated)
    }
  }, [applyQuota, refreshQuota, survey])

  if (quota?.mode === 'authenticated') {
    return (
      <p className="mt-6 border-t border-line pt-4 text-sm leading-6 text-muted">
        <span className="font-semibold text-ink">{copy.memberTitle}</span>
        <span className="mx-2 text-line">/</span>
        {copy.memberDescription}
      </p>
    )
  }

  const limit = quota?.limit ?? 3
  const remaining = quota?.remaining
  const status =
    remaining === undefined
      ? copy.available.replace('{limit}', String(limit))
      : remaining === 0
        ? copy.exhausted
        : copy.remaining
            .replace('{remaining}', String(remaining))
            .replace('{limit}', String(limit))

  return (
    <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line pt-4 text-sm leading-6 text-muted">
      <p>
        <span className="font-semibold text-ink">{copy.anonymousTitle}</span>
        <span className="mx-2 text-line">/</span>
        {status}
      </p>
      <p className="shrink-0 font-mono text-xs font-bold tracking-[0.08em] text-accentDark" aria-live="polite">
        {remaining === undefined ? `… / ${limit}` : `${remaining} / ${limit} kaldı`}
      </p>
    </div>
  )
}
