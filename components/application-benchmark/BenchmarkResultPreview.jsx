import { Check } from 'lucide-react'

function monthIndex(value) {
  if (!value) return null
  const [year, month] = value.split('-').map(Number)
  if (!year || !month) return null
  return year * 12 + month
}

function getDurationDays(state) {
  const start = monthIndex(state.searchStartedAt)
  const now = new Date()
  const currentMonth = now.getFullYear() * 12 + now.getMonth() + 1
  const end = monthIndex(state.searchEndedAt) ?? currentMonth

  if (start === null || end < start) return '—'
  return Math.max(1, end - start) * 30
}

function ComparisonMetric({ label, peerDetail, peerValue, suffix, value, copy }) {
  return (
    <div className="border border-[var(--line-strong)] px-5 py-4">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">{label}</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted">{copy.yourValueLabel}</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-[-0.07em] text-ink">
            {value}{value !== '—' && suffix ? <span className="ml-1 text-xs tracking-normal text-muted">{suffix}</span> : null}
          </p>
        </div>
        <div className="border-l border-line pl-4">
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted">{copy.peerValueLabel}</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-[-0.07em] text-ink">
            {peerValue}{peerValue !== '—' && suffix ? <span className="ml-1 text-xs tracking-normal text-muted">{suffix}</span> : null}
          </p>
          {peerDetail ? <p className="mt-1 text-xs text-muted">{peerDetail}</p> : null}
        </div>
      </div>
    </div>
  )
}

function RateComparison({ label, peerValue, value, copy }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3 first:border-t-0 first:pt-0">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="text-right text-sm text-muted">
        <span className="font-semibold text-ink">{copy.yourValueLabel} %{formatNumber(Math.round(value))}</span>
        <span className="px-1 text-lineStrong">/</span>
        <span>{copy.peerValueLabel} %{formatNumber(Math.round(peerValue))}</span>
      </p>
    </div>
  )
}

function FunnelComparison({ comparison, copy, interviewRate, responseRate }) {
  const rows = [
    { label: copy.responseLabel, personal: responseRate, peer: comparison.responseRate },
    { label: copy.interviewLabel, personal: interviewRate, peer: comparison.interviewRate },
  ]

  return (
    <section className="mt-7 border-t border-[var(--line-strong)] pt-5" aria-label={copy.comparisonFunnelTitle}>
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">{copy.comparisonFunnelTitle}</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted">{row.label}</p>
              <p className="font-mono text-xs font-bold text-ink">%{formatNumber(Math.round(row.personal), undefined)} <span className="text-muted">/</span> %{formatNumber(Math.round(row.peer), undefined)}</p>
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-muted">{copy.yourValueLabel}</span>
                <span className="h-1.5 flex-1 bg-line"><span className="block h-full bg-ink" style={{ width: `${Math.min(100, row.personal)}%` }} /></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-muted">{copy.peerValueLabel}</span>
                <span className="h-1.5 flex-1 bg-line"><span className="block h-full bg-accent" style={{ width: `${Math.min(100, row.peer)}%` }} /></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function formatNumber(value, locale) {
  return value === null || value === undefined ? '—' : new Intl.NumberFormat(locale).format(value)
}

function getSignal({ comparison, personalInterviewRate, personalMonthlyApplications, personalResponseRate, copy }) {
  if (!comparison || comparison.status !== 'live') {
    return copy.collectingSignal
  }
  if (personalMonthlyApplications < comparison.applicationsPerMonthMedian * 0.7) {
    return copy.signals.activity
  }
  if (personalResponseRate < comparison.responseRate * 0.7) {
    return copy.signals.response
  }
  if (personalInterviewRate < comparison.interviewRate * 0.7) {
    return copy.signals.interview
  }
  return copy.signals.withinRange
}

export default function BenchmarkResultPreview({ contextCopy, copy, locale, onRefreshComparison, state }) {
  const applications = Number(state.applicationsCount) || 0
  const humanResponses = Number(state.humanResponsesCount) || 0
  const technicalInterviews = Number(state.technicalInterviewsCount) || 0
  const stages = [
    { label: copy.yourApplicationsLabel, value: applications },
    { label: copy.responseLabel, value: humanResponses },
    { label: copy.hrLabel, value: Number(state.hrInterviewsCount) || 0 },
    { label: copy.technicalLabel, value: technicalInterviews },
    { label: copy.offerLabel, value: Number(state.offersCount) || 0 },
  ]
  const durationDays = getDurationDays(state)
  const durationMonths = durationDays === '—' ? null : Math.max(1, durationDays / 30)
  const personalMonthlyApplications = durationMonths === null
    ? null
    : Math.round(applications / durationMonths)
  const responseRate = applications > 0
    ? (humanResponses / applications) * 100
    : null
  const interviewRate = applications > 0
    ? (Number(state.anyInterviewsCount) / applications) * 100
    : null
  const comparison = state.comparison
  const durationRange = comparison?.status === 'live'
    && comparison.durationDaysP25 !== null
    && comparison.durationDaysP75 !== null
    ? copy.durationRange
      .replace('{from}', formatNumber(comparison.durationDaysP25, locale))
      .replace('{to}', formatNumber(comparison.durationDaysP75, locale))
    : null
  const personalSignal = personalMonthlyApplications === null || responseRate === null || interviewRate === null
    ? copy.collectingSignal
    : getSignal({
        comparison,
        personalInterviewRate: interviewRate,
        personalMonthlyApplications,
        personalResponseRate: responseRate,
        copy,
      })
  const cohort = [
    { label: contextCopy.fields.role.label, value: state.roleLabel || contextCopy.fields.role.options[state.role] || state.role },
    { label: contextCopy.fields.sector.label, value: contextCopy.fields.sector.options[state.sector] },
    { label: contextCopy.fields.roleLevel.label, value: contextCopy.fields.roleLevel.options[state.roleLevel] },
    { label: contextCopy.fields.experienceBand.label, value: contextCopy.fields.experienceBand.options[state.experienceBand] },
    { label: contextCopy.fields.targetRegion.label, value: contextCopy.fields.targetRegion.options[state.targetRegion] },
  ].filter((item) => item.value)

  return (
    <div className="flex min-h-[520px] flex-col justify-center" role="status">
      <div className="grid h-12 w-12 place-items-center border border-[var(--accent-border)] bg-[var(--accent-soft)] text-accentDark">
        <Check size={22} aria-hidden="true" />
      </div>
      <p className="mt-7 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
        {comparison?.status === 'live' ? copy.mockLabel : copy.collectingLabel}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-ink sm:text-4xl">
        {copy.title}
      </h2>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        {comparison?.status === 'live' ? copy.description : copy.collectingDescription}
      </p>

      <section className="mt-7 border-y border-line py-4" aria-label={copy.cohortLabel}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-accentDark">{copy.cohortLabel}</p>
          {comparison?.status === 'live' ? <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted">{copy.matchLevels[comparison.matchLevel]}</p> : null}
        </div>
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
          {cohort.map((item) => (
            <div key={item.label}>
              <dt className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted">{item.label}</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ComparisonMetric
          copy={copy}
          label={copy.durationComparisonLabel}
          peerDetail={durationRange}
          peerValue={formatNumber(comparison?.durationDaysMedian, locale)}
          suffix={copy.dayUnit}
          value={durationDays}
        />
        <ComparisonMetric
          copy={copy}
          label={copy.applicationPaceComparisonLabel}
          peerValue={formatNumber(comparison?.applicationsPerMonthMedian, locale)}
          suffix={personalMonthlyApplications !== null ? copy.applicationUnit : undefined}
          value={formatNumber(personalMonthlyApplications, locale)}
        />
      </div>

      <div className="mt-7 border-l-2 border-accent bg-[var(--accent-soft)] px-5 py-4">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-accentDark">
          {copy.personalSignalLabel}
        </p>
        <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-ink">{personalSignal}</p>
        {responseRate !== null && interviewRate !== null && comparison?.status === 'live' && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-x-8">
            <RateComparison copy={copy} label={copy.responseLabel} peerValue={comparison.responseRate} value={responseRate} />
            <RateComparison copy={copy} label={copy.interviewLabel} peerValue={comparison.interviewRate} value={interviewRate} />
          </div>
        )}
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">{copy.supportNote}</p>
      </div>

      <div className="mt-7 border-t border-[var(--line-strong)] pt-5">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
          {copy.conversionTitle}
        </p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {stages.map((stage, index) => {
            const width = applications > 0 ? Math.min(100, Math.round((stage.value / applications) * 100)) : 0
            return (
              <div key={stage.label}>
                <div className="h-1 bg-[var(--line)]">
                  <span
                    className={`block h-full ${index === stages.length - 1 ? 'bg-accent' : 'bg-ink'}`}
                    style={{ width: `${stage.value > 0 ? Math.max(4, width) : 0}%` }}
                  />
                </div>
                <p className="mt-2 font-mono text-lg font-bold text-ink">{stage.value}</p>
                <p className="mt-1 font-mono text-[8px] font-bold uppercase leading-3 tracking-[0.05em] text-muted">
                  {stage.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {comparison?.status === 'live' && responseRate !== null && interviewRate !== null ? (
        <FunnelComparison comparison={comparison} copy={copy} interviewRate={interviewRate} responseRate={responseRate} />
      ) : null}

      <p className="mt-6 max-w-2xl text-xs leading-5 text-muted">
        {comparison?.status === 'live'
          ? copy.liveNote.replace('{count}', formatNumber(comparison.cohortSize, locale))
          : copy.previewNote}
      </p>
      {comparison?.status === 'collecting' ? (
        <button
          className="mt-5 h-10 w-fit border border-ink px-4 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-surface"
          onClick={onRefreshComparison}
          type="button"
        >
          {copy.refreshComparison}
        </button>
      ) : null}
    </div>
  )
}
