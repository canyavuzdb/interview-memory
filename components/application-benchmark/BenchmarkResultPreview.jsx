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

function Metric({ label, suffix, value }) {
  return (
    <div className="px-4 py-5">
      <p className="font-mono text-3xl font-bold tracking-[-0.08em] text-ink">
        {value}{value !== '—' && suffix ? <span className="ml-1 text-sm tracking-normal text-muted">{suffix}</span> : null}
      </p>
      <p className="mt-2 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
        {label}
      </p>
    </div>
  )
}

export default function BenchmarkResultPreview({ contextCopy, copy, state }) {
  const applications = Number(state.applicationsCount) || 0
  const responses = Number(state.responsesCount) || 0
  const technicalInterviews = Number(state.technicalInterviewsCount) || 0
  const stages = [
    { label: copy.yourApplicationsLabel, value: applications },
    { label: copy.responseLabel, value: responses },
    { label: copy.hrLabel, value: Number(state.hrInterviewsCount) || 0 },
    { label: copy.technicalLabel, value: technicalInterviews },
    { label: copy.offerLabel, value: Number(state.offersCount) || 0 },
  ]
  const durationDays = getDurationDays(state)
  const applicationsPerTechnicalInterview = technicalInterviews > 0
    ? Math.ceil(applications / technicalInterviews)
    : null
  const responseRate = applications > 0 ? Math.round((responses / applications) * 100) : null
  const personalSignal = applicationsPerTechnicalInterview !== null
    ? `${applicationsPerTechnicalInterview} ${copy.applicationsPerTechnicalSuffix}`
    : copy.noTechnicalInterviewSignal
  const cohort = [
    contextCopy.fields.role.options[state.role],
    contextCopy.fields.roleLevel.options[state.roleLevel],
    contextCopy.fields.experienceBand.options[state.experienceBand],
    contextCopy.fields.targetRegion.options[state.targetRegion],
  ].filter(Boolean).join(' · ')

  return (
    <div className="flex min-h-[520px] flex-col justify-center" role="status">
      <div className="grid h-12 w-12 place-items-center border border-[var(--accent-border)] bg-[var(--accent-soft)] text-accentDark">
        <Check size={22} aria-hidden="true" />
      </div>
      <p className="mt-7 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
        {copy.mockLabel}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-ink sm:text-4xl">
        {copy.title}
      </h2>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        {copy.description}
      </p>

      <p className="mt-6 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-accentDark">
        {copy.cohortLabel}: {cohort}
      </p>

      <div className="mt-5 grid grid-cols-2 divide-x divide-y divide-[var(--line-strong)] border border-[var(--line-strong)] sm:grid-cols-4 sm:divide-y-0">
        <Metric label={copy.yourDurationLabel} suffix={copy.dayUnit} value={durationDays} />
        <Metric label={copy.communityDurationLabel} suffix={copy.dayUnit} value="72" />
        <Metric
          label={copy.yourTechnicalEffortLabel}
          suffix={applicationsPerTechnicalInterview !== null ? copy.applicationUnit : undefined}
          value={applicationsPerTechnicalInterview ?? '—'}
        />
        <Metric label={copy.communityTechnicalEffortLabel} suffix={copy.applicationUnit} value="14" />
      </div>

      <div className="mt-7 border-l-2 border-accent bg-[var(--accent-soft)] px-5 py-4">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-accentDark">
          {copy.personalSignalLabel}
        </p>
        <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-ink">{personalSignal}</p>
        {responseRate !== null && (
          <p className="mt-2 text-sm leading-6 text-muted">
            {copy.responseRatePrefix} <span className="font-semibold text-ink">%{responseRate}</span> {copy.responseRateSuffix}
          </p>
        )}
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

      <p className="mt-6 max-w-2xl text-xs leading-5 text-muted">{copy.previewNote}</p>
    </div>
  )
}
