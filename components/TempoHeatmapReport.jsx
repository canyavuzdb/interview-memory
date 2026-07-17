'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  useId,
  useRef,
  useState,
} from 'react'
import ReportMethodology from './ReportMethodology'

const VIEWS = ['candidate', 'company']
const CANDIDATE_METRICS = ['responses', 'offers']

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

function heatCellColor(rate) {
  const boundedRate = Math.max(0, Math.min(1, rate || 0))
  const mix = Math.round(5 + boundedRate * 53)

  return `color-mix(in srgb, var(--accent) ${mix}%, var(--surface))`
}

function HeatLegend({ copy }) {
  return (
    <div className="flex items-center gap-2" aria-label={copy.label}>
      <span className="font-mono text-[7px] font-bold uppercase tracking-[0.05em] text-muted">
        {copy.low}
      </span>
      <span
        aria-hidden="true"
        className="h-2 w-20 border border-line sm:w-28"
        style={{
          background: `linear-gradient(to right, ${heatCellColor(0)}, ${heatCellColor(1)})`,
        }}
      />
      <span className="font-mono text-[7px] font-bold uppercase tracking-[0.05em] text-muted">
        {copy.high}
      </span>
    </div>
  )
}

function SummaryStrip({ items }) {
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-4 px-4 pb-7 sm:px-7 sm:pb-8">
      {items.map((item) => (
        <div key={item.label} className="min-w-[7rem]">
          <dt className="font-mono text-[7px] font-bold uppercase leading-3 tracking-[0.06em] text-muted">
            {item.label}
          </dt>
          <dd className="mt-1.5 font-mono text-base font-bold tracking-[-0.035em] text-ink">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function ReportPanelIntro({
  copy,
  tools,
}) {
  return (
    <div className="grid gap-5 px-4 pb-6 pt-7 sm:px-7 sm:pb-7 sm:pt-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="max-w-3xl">
        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-ink sm:text-3xl">
          {copy.title}
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{copy.description}</p>
      </div>
      {tools}
    </div>
  )
}

function CandidateMetricToggle({
  copy,
  metric,
  onChange,
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">
        {copy.metricsLabel}
      </legend>
      <div className="flex gap-5 border-b border-line">
        {CANDIDATE_METRICS.map((metricId) => {
          const active = metric === metricId

          return (
            <button
              key={metricId}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(metricId)}
              className={`report-text-control min-h-10 border-b px-0 font-mono text-[8px] font-bold uppercase tracking-[0.06em] transition-colors ${
                active
                  ? 'border-accent text-ink'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {copy.metrics[metricId]}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function candidateNumerator(cell, metric) {
  return metric === 'offers' ? cell.offersCount : cell.responsesCount
}

function CandidateDesktopTable({
  copy,
  locale,
  metric,
  rows,
}) {
  const paceBands = rows[0]?.cells.map((cell) => cell.paceBand) || []

  return (
    <div className="hidden px-4 pb-8 sm:px-7 md:block">
      <table className="w-full table-fixed border-separate border-spacing-1.5">
        <caption className="sr-only">{copy.tableCaption[metric]}</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="w-[18%] px-3 py-2 text-left font-mono text-[7px] font-bold uppercase leading-3 tracking-[0.06em] text-muted"
            >
              {copy.rowLabel}
            </th>
            {paceBands.map((paceBand) => (
              <th
                key={paceBand}
                scope="col"
                className="px-2 py-2 text-center font-mono text-[7px] font-bold uppercase leading-3 tracking-[0.04em] text-muted"
              >
                {copy.paceBands[paceBand]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.durationBand}>
              <th
                scope="row"
                className="px-3 py-4 text-left text-xs font-semibold leading-4 text-ink"
              >
                {copy.durationBands[row.durationBand]}
              </th>
              {row.cells.map((cell) => {
                const numerator = candidateNumerator(cell, metric)
                const rate = cell.applicationsCount
                  ? numerator / cell.applicationsCount
                  : 0

                return (
                  <td
                    key={`${row.durationBand}-${cell.paceBand}`}
                    className="p-0 text-center"
                  >
                    <div
                      className="flex min-h-[78px] flex-col items-center justify-center px-2 py-3"
                      style={{ backgroundColor: heatCellColor(rate) }}
                    >
                      <span className="font-mono text-lg font-bold tracking-[-0.05em] text-ink">
                        {formatPercent(numerator, cell.applicationsCount, locale)}
                      </span>
                      <span className="sr-only">
                        n={formatNumber(cell.applicationsCount, locale)}
                      </span>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CandidateMobileCards({
  copy,
  locale,
  metric,
  rows,
}) {
  return (
    <div className="divide-y divide-line px-4 pb-7 sm:px-7 md:hidden">
      {rows.map((row) => (
        <section key={row.durationBand} className="py-6">
          <h4 className="font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-ink">
            {copy.durationBands[row.durationBand]}
          </h4>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {row.cells.map((cell) => {
              const numerator = candidateNumerator(cell, metric)
              const rate = cell.applicationsCount
                ? numerator / cell.applicationsCount
                : 0

              return (
                <div
                  key={`${row.durationBand}-${cell.paceBand}`}
                  className="min-w-0 p-3.5"
                  style={{ backgroundColor: heatCellColor(rate) }}
                >
                  <p className="min-h-7 font-mono text-[7px] font-bold uppercase leading-3 tracking-[0.04em] text-muted">
                    {copy.paceBands[cell.paceBand]}
                  </p>
                  <p className="mt-2 font-mono text-lg font-bold tracking-[-0.05em] text-ink">
                    {formatPercent(numerator, cell.applicationsCount, locale)}
                  </p>
                  <p className="sr-only">
                    n={formatNumber(cell.applicationsCount, locale)}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function CandidateTempoPanel({
  copy,
  legendCopy,
  locale,
  report,
}) {
  const [metric, setMetric] = useState('responses')
  const cells = report.rows.flatMap((row) => row.cells)
  const episodeCount = cells.reduce((sum, cell) => sum + cell.episodeCount, 0)
  const applicationsCount = cells.reduce((sum, cell) => sum + cell.applicationsCount, 0)
  const numerator = cells.reduce(
    (sum, cell) => sum + candidateNumerator(cell, metric),
    0,
  )

  return (
    <>
      <ReportPanelIntro
        copy={copy}
        tools={(
          <CandidateMetricToggle
            copy={copy}
            metric={metric}
            onChange={setMetric}
          />
        )}
      />

      <SummaryStrip
        items={[
          {
            label: copy.summary.episodes,
            value: formatNumber(episodeCount, locale),
          },
          {
            label: copy.summary.applications,
            value: formatNumber(applicationsCount, locale),
          },
          {
            label: copy.summary.overall[metric],
            value: formatPercent(numerator, applicationsCount, locale),
          },
        ]}
      />

      <div key={metric} className="tempo-metric-view">
        <CandidateDesktopTable
          copy={copy}
          locale={locale}
          metric={metric}
          rows={report.rows}
        />
        <CandidateMobileCards
          copy={copy}
          locale={locale}
          metric={metric}
          rows={report.rows}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <HeatLegend copy={legendCopy} />
        <Link
          href={`/${locale}/surveys/application-benchmark`}
          className="report-action self-start sm:self-auto"
        >
          {copy.contributeCta}
          <ArrowRight size={13} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      </div>
    </>
  )
}

function CompanyDesktopTable({
  copy,
  locale,
  rows,
}) {
  const actualBands = rows[0]?.cells.map((cell) => cell.actualBand) || []

  return (
    <div className="hidden px-4 pb-8 sm:px-7 lg:block">
      <table className="w-full table-fixed border-separate border-spacing-1.5">
        <caption className="sr-only">{copy.tableCaption}</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="w-[16%] px-3 py-2 text-left font-mono text-[7px] font-bold uppercase leading-3 tracking-[0.06em] text-muted"
            >
              {copy.rowLabel}
            </th>
            {actualBands.map((actualBand) => (
              <th
                key={actualBand}
                scope="col"
                className="px-2 py-2 text-center font-mono text-[7px] font-bold uppercase leading-3 tracking-[0.04em] text-muted"
              >
                {copy.actualBands[actualBand]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.promisedBand}>
              <th
                scope="row"
                className="px-3 py-4 text-left text-xs font-semibold leading-4 text-ink"
              >
                {copy.promisedBands[row.promisedBand]}
                <span className="mt-1 block font-mono text-[7px] font-bold text-muted">
                  n={formatNumber(row.eligibleCount, locale)}
                </span>
              </th>
              {row.cells.map((cell) => {
                const rate = row.eligibleCount ? cell.count / row.eligibleCount : 0

                return (
                  <td
                    key={`${row.promisedBand}-${cell.actualBand}`}
                    className="p-0 text-center"
                  >
                    <div
                      className="flex min-h-[72px] flex-col items-center justify-center px-1 py-2"
                      style={{ backgroundColor: heatCellColor(rate) }}
                    >
                      <span className="font-mono text-sm font-bold tracking-[-0.04em] text-ink">
                        {formatPercent(cell.count, row.eligibleCount, locale)}
                      </span>
                      <span className="sr-only">
                        n={formatNumber(cell.count, locale)}
                      </span>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CompanyMobileCards({
  copy,
  locale,
  rows,
}) {
  return (
    <div className="divide-y divide-line px-4 pb-7 sm:px-7 lg:hidden">
      {rows.map((row) => (
        <section key={row.promisedBand} className="py-6">
          <div className="flex items-baseline justify-between gap-4">
            <h4 className="font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-ink">
              {copy.promisedBands[row.promisedBand]}
            </h4>
            <span className="font-mono text-[7px] font-bold text-muted">
              n={formatNumber(row.eligibleCount, locale)}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {row.cells.map((cell) => {
              const rate = row.eligibleCount ? cell.count / row.eligibleCount : 0

              return (
                <div
                  key={`${row.promisedBand}-${cell.actualBand}`}
                  className="min-w-0 p-3.5"
                  style={{ backgroundColor: heatCellColor(rate) }}
                >
                  <p className="min-h-7 font-mono text-[7px] font-bold uppercase leading-3 tracking-[0.04em] text-muted">
                    {copy.actualBands[cell.actualBand]}
                  </p>
                  <p className="mt-2 font-mono text-lg font-bold tracking-[-0.05em] text-ink">
                    {formatPercent(cell.count, row.eligibleCount, locale)}
                  </p>
                  <p className="mt-1 font-mono text-[7px] font-bold text-muted">
                    n={formatNumber(cell.count, locale)}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function CompanyTempoPanel({
  copy,
  legendCopy,
  locale,
  report,
}) {
  const eligibleCount = report.rows.reduce((sum, row) => sum + row.eligibleCount, 0)
  const noResponseCount = report.rows.reduce((sum, row) => (
    sum + (row.cells.find((cell) => cell.actualBand === 'reported_no_response')?.count || 0)
  ), 0)
  const promiseProvidedCount = report.rows.reduce((sum, row) => (
    row.promisedBand === 'not_provided' ? sum : sum + row.eligibleCount
  ), 0)

  return (
    <>
      <ReportPanelIntro copy={copy} />

      <SummaryStrip
        items={[
          {
            label: copy.summary.processes,
            value: formatNumber(eligibleCount, locale),
          },
          {
            label: copy.summary.reportedNoResponse,
            value: formatPercent(noResponseCount, eligibleCount, locale),
          },
          {
            label: copy.summary.promiseCoverage,
            value: formatPercent(promiseProvidedCount, eligibleCount, locale),
          },
        ]}
      />

      <CompanyDesktopTable copy={copy} locale={locale} rows={report.rows} />
      <CompanyMobileCards copy={copy} locale={locale} rows={report.rows} />

      <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <HeatLegend copy={legendCopy} />
        <Link
          href={`/${locale}/surveys/company-experience`}
          className="report-action self-start sm:self-auto"
        >
          {copy.contributeCta}
          <ArrowRight size={13} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      </div>
    </>
  )
}

function TempoViewTabs({
  activeView,
  componentId,
  copy,
  onActivate,
  tabRefs,
}) {
  const activeIndex = Math.max(VIEWS.indexOf(activeView), 0)

  function handleKeyDown(event, index) {
    let nextIndex

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % VIEWS.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + VIEWS.length) % VIEWS.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = VIEWS.length - 1
    } else {
      return
    }

    event.preventDefault()
    onActivate(VIEWS[nextIndex])
    window.requestAnimationFrame(() => tabRefs.current[nextIndex]?.focus())
  }

  return (
    <div className="border-b border-line px-4 sm:px-7">
      <div
        role="tablist"
        aria-label={copy.viewsLabel}
        className="relative grid max-w-xl grid-cols-2 gap-7"
        style={{
          '--tempo-active-index': activeIndex,
          '--tempo-tab-gap': '1.75rem',
        }}
      >
        <span
          aria-hidden="true"
          className="tempo-view-tab-indicator absolute left-0"
        />
        {VIEWS.map((view, index) => {
          const active = activeView === view

          return (
            <button
              key={view}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              id={`${componentId}-tab-${view}`}
              type="button"
              role="tab"
              tabIndex={active ? 0 : -1}
              aria-controls={`${componentId}-panel-${view}`}
              aria-selected={active}
              onClick={() => onActivate(view)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`report-text-control relative z-10 min-h-12 px-0 text-left font-mono text-[8px] font-bold uppercase tracking-[0.07em] transition-colors duration-300 sm:text-[9px] ${
                active ? 'text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {copy.views[view]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function TempoHeatmapReport({
  copy,
  locale,
  report,
}) {
  const componentId = useId().replaceAll(':', '')
  const tabRefs = useRef([])
  const previousViewRef = useRef(null)
  const [activeView, setActiveView] = useState('candidate')
  const [previousView, setPreviousView] = useState(null)
  const [direction, setDirection] = useState('forward')

  function activateView(nextView) {
    if (nextView === activeView || !VIEWS.includes(nextView)) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const currentIndex = VIEWS.indexOf(activeView)
    const nextIndex = VIEWS.indexOf(nextView)

    setDirection(nextIndex >= currentIndex ? 'forward' : 'backward')
    previousViewRef.current = reduceMotion ? null : activeView
    setPreviousView(reduceMotion ? null : activeView)
    setActiveView(nextView)
  }

  function completeTransition(view, event) {
    if (event.target !== event.currentTarget || previousViewRef.current !== view) return

    previousViewRef.current = null
    setPreviousView(null)
  }

  return (
    <div className="overflow-hidden border border-line bg-surface">
      <TempoViewTabs
        activeView={activeView}
        componentId={componentId}
        copy={copy}
        onActivate={activateView}
        tabRefs={tabRefs}
      />

      <div className="tempo-view-stack">
        {VIEWS.map((view) => {
          const active = activeView === view
          const outgoing = previousView === view

          return (
            <div
              key={view}
              id={`${componentId}-panel-${view}`}
              role="tabpanel"
              aria-labelledby={`${componentId}-tab-${view}`}
              aria-hidden={!active || undefined}
              inert={!active || undefined}
              onAnimationEnd={outgoing ? (event) => completeTransition(view, event) : undefined}
              className={`tempo-view ${
                active
                  ? 'tempo-view-in'
                  : outgoing
                    ? 'tempo-view-out'
                    : 'tempo-view-parked'
              }`}
              style={{
                '--tempo-enter-x': direction === 'forward' ? '8px' : '-8px',
                '--tempo-exit-x': direction === 'forward' ? '-8px' : '8px',
              }}
            >
              {view === 'candidate' ? (
                <CandidateTempoPanel
                  copy={copy.candidate}
                  legendCopy={copy.legend}
                  locale={locale}
                  report={report.candidateTempo}
                />
              ) : (
                <CompanyTempoPanel
                  copy={copy.company}
                  legendCopy={copy.legend}
                  locale={locale}
                  report={report.companyResponseTempo}
                />
              )}
            </div>
          )
        })}
      </div>

      <ReportMethodology
        label={copy.methodologyLabel}
        text={copy.methodology}
      />
    </div>
  )
}
