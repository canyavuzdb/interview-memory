import Link from 'next/link'
import { ArrowUpRight, ChartNoAxesColumnIncreasing, Gauge, LockKeyhole, MessageCircleOff } from 'lucide-react'

function localeTag(locale) {
  return locale === 'tr' ? 'tr-TR' : 'en-US'
}

function formatNumber(value, locale) {
  return new Intl.NumberFormat(localeTag(locale)).format(value)
}

function formatPercent(numerator, denominator, locale) {
  if (!denominator) return '—'

  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(numerator / denominator)
}

function roleApplications(row) {
  return row.monthlyApplications.reduce((sum, item) => sum + item.count, 0)
}

function ReportHeader({ audience, code, icon: Icon, question, title }) {
  return (
    <header className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="inline-flex items-center gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.09em] text-accentDark">
          <Icon size={13} strokeWidth={1.7} aria-hidden="true" />
          {code} · {title}
        </p>
        <span className="shrink-0 rounded-full border border-line px-2.5 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-muted">
          {audience}
        </span>
      </div>
      <h3 className="mt-3 max-w-xl text-xl font-semibold leading-[1.12] tracking-[-0.035em] text-ink sm:text-2xl">
        {question}
      </h3>
    </header>
  )
}

function LockedLink({ href, label }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-11 items-center gap-2 border border-[var(--line-strong)] bg-surface px-3 font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-ink shadow-sm transition-colors hover:border-ink hover:bg-ink hover:text-surface"
    >
      <LockKeyhole size={12} strokeWidth={1.8} aria-hidden="true" />
      {label}
      <ArrowUpRight size={12} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  )
}

function LockedRows({ href, label }) {
  return (
    <div className="relative min-h-[112px] flex-1 overflow-hidden border-t border-line">
      <div aria-hidden="true" className="divide-y divide-line opacity-45">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className={`${row > 1 ? 'hidden lg:grid' : 'grid'} h-14 grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(3.5rem,0.7fr))] items-center gap-3 px-4 sm:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(4rem,0.65fr))] sm:gap-4 sm:px-5`}>
            <span className="h-2.5 w-28 bg-[var(--line-emphasis)]" />
            <span className="ml-auto hidden h-2 w-10 bg-[var(--line)] sm:block" />
            <span className="ml-auto h-2 w-10 bg-[var(--line)]" />
            <span className="ml-auto h-2 w-10 bg-[var(--line)]" />
          </div>
        ))}
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--surface) 82%, transparent) 42%, var(--surface) 78%)' }}
      >
        <LockedLink href={href} label={label} />
      </div>
    </div>
  )
}

function RoleBenchmarkPreview({ copy, locale, report }) {
  const visibleRows = report.roleMonthly

  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-[var(--line-strong)] bg-surface shadow-[var(--shadow-card)] md:col-span-2 lg:col-span-7 lg:row-span-2">
      <ReportHeader
        audience={copy.audience}
        code={copy.code}
        icon={ChartNoAxesColumnIncreasing}
        question={copy.question}
        title={copy.title}
      />

      <div className="flex flex-1 flex-col border-y border-[var(--line-strong)]">
        <div className="grid grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(3.5rem,0.7fr))] gap-3 bg-[var(--surface-muted)] px-4 py-2.5 sm:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(4rem,0.65fr))] sm:gap-4 sm:px-5">
          <p className="font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-muted">{copy.columns.role}</p>
          <p className="hidden text-right font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-muted sm:block">{copy.columns.applications}</p>
          <p className="text-right font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-muted">{copy.columns.response}</p>
          <p className="text-right font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-muted">{copy.columns.employment}</p>
        </div>

        <div className="divide-y divide-line">
          {visibleRows.map((row) => {
            const applications = roleApplications(row)

            return (
              <div key={row.id} className="grid min-h-[62px] grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(3.5rem,0.7fr))] items-center gap-3 px-4 py-2 sm:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(4rem,0.65fr))] sm:gap-4 sm:px-5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-4 text-ink sm:text-sm">{copy.roles[row.roleFamily]}</p>
                  <p className="mt-1 font-mono text-[7px] font-bold uppercase tracking-[0.05em] text-muted">
                    n={formatNumber(row.uniqueCandidates, locale)}
                  </p>
                </div>
                <p className="hidden text-right font-mono text-xs font-bold text-ink sm:block">{formatNumber(applications, locale)}</p>
                <p className="text-right font-mono text-xs font-bold text-ink">{formatPercent(row.responsesCount, applications, locale)}</p>
                <p className="text-right font-mono text-xs font-bold text-accentDark">
                  {formatPercent(row.employmentStartedCount, row.matureSearchEpisodesCount, locale)}
                </p>
              </div>
            )
          })}
        </div>

        <LockedRows href={`/${locale}/benchmarks#role-benchmark`} label={copy.unlockCta} />
      </div>

      <footer className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <p className="font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-muted">
          {copy.previewNote}
        </p>
        <Link
          href={`/${locale}/surveys/application-benchmark`}
          className="shrink-0 font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-accentDark hover:text-ink"
        >
          {copy.contributeCta} →
        </Link>
      </footer>
    </article>
  )
}

function heatCellColor(rate) {
  const ratio = Math.max(0, Math.min(1, rate || 0))
  const mix = Math.round(6 + ratio * 84)

  return `color-mix(in srgb, var(--accent) ${mix}%, var(--surface))`
}

function HeatmapPreview({ copy, locale, report }) {
  const rows = report.activityTiming.candidateTempo.rows
  const paceBands = rows[0]?.cells.map((cell) => cell.paceBand) || []

  return (
    <article className="overflow-hidden rounded-sm border border-[var(--line-strong)] bg-surface shadow-[var(--shadow-card)] lg:col-span-5">
      <ReportHeader
        audience={copy.audience}
        code={copy.code}
        icon={Gauge}
        question={copy.question}
        title={copy.title}
      />

      <div className="border-t border-line px-4 pb-3 pt-4 sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[7px] font-bold uppercase tracking-[0.07em] text-accentDark">
            {copy.metricLabel}
          </p>
          <p className="font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-muted">
            {copy.rowLabel}
          </p>
        </div>

        <div className="mt-3" role="img" aria-label={copy.previewAria}>
          <div
            className="grid grid-cols-[3.75rem_repeat(3,minmax(0,1fr))] gap-1"
            aria-hidden="true"
          >
            <span />
            {paceBands.map((paceBand) => (
              <span
                key={paceBand}
                className="pb-1 text-center font-mono text-[6px] font-bold uppercase leading-3 tracking-[0.03em] text-muted"
              >
                {copy.paceBands[paceBand]}
              </span>
            ))}

            {rows.flatMap((row) => [
              <span
                key={`${row.durationBand}-label`}
                className="flex items-center font-mono text-[7px] font-bold leading-3 text-muted"
              >
                {copy.durationBands[row.durationBand]}
              </span>,
              ...row.cells.map((cell) => {
                const rate = cell.applicationsCount
                  ? cell.responsesCount / cell.applicationsCount
                  : 0

                return (
                  <span
                    key={`${row.durationBand}-${cell.paceBand}`}
                    className="grid min-h-9 place-items-center border border-line font-mono text-[8px] font-bold text-ink"
                    style={{ backgroundColor: heatCellColor(rate) }}
                  >
                    {formatPercent(cell.responsesCount, cell.applicationsCount, locale)}
                  </span>
                )
              }),
            ])}
          </div>
        </div>

        <div className="relative mt-3 h-12 overflow-hidden border-t border-line">
          <div aria-hidden="true" className="grid h-full grid-cols-[3.75rem_repeat(3,minmax(0,1fr))] items-center gap-1 opacity-35">
            <span className="h-2 w-10 bg-[var(--line-emphasis)]" />
            {[0, 1, 2].map((cell) => (
              <span key={cell} className="h-7 bg-[var(--surface-muted)]" />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-end bg-[linear-gradient(to_right,transparent,var(--surface)_48%)]">
            <LockedLink href={`/${locale}/benchmarks#activity-heatmap`} label={copy.unlockCta} />
          </div>
        </div>
      </div>
    </article>
  )
}

function ResponsivenessPreview({ copy, locale, report }) {
  const visibleRows = report.companyResponsiveness

  return (
    <article className="overflow-hidden rounded-sm border border-[var(--line-strong)] bg-surface shadow-[var(--shadow-card)] lg:col-span-5">
      <ReportHeader
        audience={copy.audience}
        code={copy.code}
        icon={MessageCircleOff}
        question={copy.question}
        title={copy.title}
      />

      <div className="border-t border-line px-4 py-2 sm:px-5">
        <div className="divide-y divide-line">
          {visibleRows.map((row, index) => {
            const rate = row.noSubstantiveUpdateCount / row.eligibleMatureApplicationsCount

            return (
              <div key={row.id} className="grid grid-cols-[1rem_minmax(0,1fr)_3rem] items-center gap-2 py-2">
                <span className="font-mono text-[7px] font-bold text-muted">0{index + 1}</span>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-xs font-semibold text-ink">{row.company}</p>
                    <span className="font-mono text-[7px] font-bold text-muted">n={formatNumber(row.contributorsCount, locale)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-[var(--surface-muted)]">
                    <span className="block h-full bg-[var(--status-rejected)]" style={{ width: `${Math.round(rate * 100)}%` }} />
                  </div>
                </div>
                <p className="text-right font-mono text-xs font-bold text-ink">
                  {formatPercent(row.noSubstantiveUpdateCount, row.eligibleMatureApplicationsCount, locale)}
                </p>
              </div>
            )
          })}
        </div>

        <div className="relative mt-1 h-10 overflow-hidden border-t border-line" aria-label={copy.lockedAria}>
          <div aria-hidden="true" className="flex h-full items-center gap-3 opacity-35">
            <span className="h-2 w-4 bg-[var(--line-emphasis)]" />
            <span className="h-2 flex-1 bg-[var(--line)]" />
            <span className="h-2 w-10 bg-[var(--line)]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-end bg-[linear-gradient(to_right,transparent,var(--surface)_52%)]">
            <LockedLink href={`/${locale}/benchmarks#responsiveness-report`} label={copy.unlockCta} />
          </div>
        </div>
      </div>
    </article>
  )
}

export default function ReportShowcase({ copy, locale, report }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
      <RoleBenchmarkPreview copy={copy.roleBenchmark} locale={locale} report={report} />
      <HeatmapPreview copy={copy.activityHeatmap} locale={locale} report={report} />
      <ResponsivenessPreview copy={copy.responsiveness} locale={locale} report={report} />
    </div>
  )
}
