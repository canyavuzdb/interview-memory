import ResponseStatusBar from '@/components/ResponseStatusBar'

function SignalCard({ children, code, title }) {
  return (
    <article className="flex min-h-[390px] flex-col border border-[var(--line-strong)] bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-accent">
          {code}
        </p>
        <p className="text-right font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
          {title}
        </p>
      </div>
      {children}
    </article>
  )
}

function PromiseRealityCard({ code, view }) {
  const comparison = view.comparison
  const promise = Number.parseFloat(comparison.promiseValue)
  const reality = Number.parseFloat(comparison.realityValue)
  const maximum = Math.max(promise, reality)
  const rows = [
    {
      label: comparison.promiseLabel,
      value: comparison.promiseValue,
      width: `${(promise / maximum) * 100}%`,
      color: 'var(--line-emphasis)',
    },
    {
      label: comparison.realityLabel,
      value: comparison.realityValue,
      width: `${(reality / maximum) * 100}%`,
      color: 'var(--status-timely)',
    },
  ]

  return (
    <SignalCard code={code} title={view.tabLabel}>
      <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-ink">
        {view.title}
      </h3>
      <div
        role="img"
        aria-label={`${comparison.promiseLabel}: ${comparison.promiseValue}. ${comparison.realityLabel}: ${comparison.realityValue}.`}
        className="mt-auto space-y-5 pt-7"
      >
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-2 flex items-baseline justify-between gap-3 font-mono font-bold uppercase">
              <span className="text-[9px] tracking-[0.1em] text-muted">{row.label}</span>
              <span className="text-sm text-ink">{row.value}</span>
            </div>
            <div className="h-3 border border-[var(--line-strong)] bg-[var(--surface-muted)]">
              <div className="h-full" style={{ width: row.width, backgroundColor: row.color }} />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 border-t border-line pt-4 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
          <span>{comparison.deltaLabel}</span>
          <span className="shrink-0 text-sm text-accentDark">{comparison.deltaValue}</span>
        </div>
      </div>
    </SignalCard>
  )
}

function BenchmarkCard({ code, view }) {
  return (
    <SignalCard code={code} title={view.tabLabel}>
      <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-ink">
        {view.title}
      </h3>
      <div
        role="img"
        aria-label={view.description}
        className="mt-auto space-y-3 pt-7"
      >
        {view.stages.map((stage) => (
          <div key={stage.label} className="grid grid-cols-[5.25rem_1fr] items-center gap-3">
            <div className="font-mono font-bold uppercase">
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-[9px] tracking-[0.06em] text-muted">{stage.label}</span>
                <span className="text-xs text-ink">{stage.value}</span>
              </div>
            </div>
            <div className="relative h-5 border-l border-[var(--line-strong)] bg-[var(--surface-muted)]">
              <div
                className="h-full bg-ink"
                style={{ width: stage.share.replace('%', '') + '%' }}
              />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 font-mono text-[8px] font-bold text-muted">
                {stage.share}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SignalCard>
  )
}

function ResponseDistributionCard({ code, view }) {
  return (
    <SignalCard code={code} title={view.tabLabel}>
      <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-ink">
        {view.title}
      </h3>
      <div
        role="img"
        aria-label={view.distribution.map((item) => `${item.label}: ${item.value}`).join('. ')}
        className="mt-auto pt-7"
      >
        <p className="mb-3 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
          {view.chartLabel}
        </p>
        <ResponseStatusBar compact showScale distribution={view.distribution} />
      </div>
    </SignalCard>
  )
}

function FeedbackChartCard({ code, view }) {
  const meaningful = Number.parseFloat(view.distribution[0].value)

  return (
    <SignalCard code={code} title={view.tabLabel}>
      <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-ink">
        {view.title}
      </h3>
      <div
        role="img"
        aria-label={`${view.distribution[0].label}: ${view.distribution[0].value}. ${view.distribution[1].label}: ${view.distribution[1].value}.`}
        className="mt-auto flex items-center gap-5 pt-7"
      >
        <div
          className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--status-timely) 0 ${meaningful}%, var(--line-emphasis) ${meaningful}% 100%)`,
          }}
        >
          <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-surface">
            <span className="font-mono text-2xl font-bold tracking-[-0.08em] text-ink">
              {view.distribution[0].value}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          {view.distribution.map((item, index) => (
            <div key={item.label} className="flex items-start gap-2">
              <span
                className="mt-1 h-2 w-2 shrink-0"
                style={{ backgroundColor: index === 0 ? 'var(--status-timely)' : 'var(--line-emphasis)' }}
                aria-hidden="true"
              />
              <div>
                <p className="font-mono text-xs font-bold text-ink">{item.value}</p>
                <p className="mt-1 font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.06em] text-muted">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SignalCard>
  )
}

export default function CommunityStats({ copy, signalCopy }) {
  const views = Object.fromEntries(signalCopy.views.map((view) => [view.id, view]))

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="flex flex-col gap-6 border-b border-[var(--line-strong)] pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            {copy.eyebrow}
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.045em] text-ink sm:text-4xl">
            {copy.title}
          </h2>
        </div>
        <div className="max-w-md md:text-right">
          <p className="text-sm leading-6 text-muted">{copy.description}</p>
          <p className="mt-3 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.1em] text-muted">
            {copy.note}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PromiseRealityCard code="01 /" view={views['response-speed']} />
        <BenchmarkCard code="02 /" view={views['application-benchmark']} />
        <ResponseDistributionCard code="03 /" view={views['company-experience']} />
        <FeedbackChartCard code="04 /" view={views['feedback-quality']} />
      </div>
    </section>
  )
}
