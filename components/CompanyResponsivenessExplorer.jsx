'use client'

import { ChevronDown, Search } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import ReportMethodology from './ReportMethodology'

// Temporary testing mode: make every eligible aggregate row inspectable.
// Restore the public default to 10 before a production release.
const MIN_SAMPLE_OPTIONS = [1, 5, 10, 25, 50]
const OVERVIEW_SAMPLE_THRESHOLD = 1

function localeTag(locale) {
  return locale === 'tr' ? 'tr-TR' : 'en-US'
}

function formatNumber(value, locale) {
  return new Intl.NumberFormat(localeTag(locale)).format(value)
}

function formatRate(numerator, denominator, locale) {
  if (!denominator) return '—'

  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(numerator / denominator)
}

function formatScore(value, locale) {
  if (value === null) return '—'

  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: 1,
  }).format(value)
}

function roleNarrative({ company, copy, locale, role }) {
  return interpolateCopy(copy.treemap.roleNarrative, {
    applications: formatNumber(role.applicationsCount, locale),
    candidates: formatNumber(role.contributorsCount, locale),
    company,
    employment: formatNumber(role.employmentStartedApplicationsCount, locale),
    final: formatNumber(role.finalApplicationsCount, locale),
    hr: formatNumber(role.hrScreenApplicationsCount, locale),
    interview: formatNumber(role.interviewedApplicationsCount, locale),
    offer: formatNumber(role.offeredApplicationsCount, locale),
    response: formatNumber(role.respondedApplicationsCount, locale),
    role: role.role,
    technical: formatNumber(role.technicalApplicationsCount, locale),
  })
}

function interpolateCopy(template, values) {
  if (typeof template !== 'string') return ''

  return template.replace(/\{\{?(\w+)\}?\}/g, (match, key) => (
    Object.hasOwn(values, key) ? values[key] : match
  ))
}

function responseRate(item) {
  if (!item.applicationsCount && !item.eligibleMatureApplicationsCount) return 0

  const applications = item.applicationsCount ?? item.eligibleMatureApplicationsCount
  return item.respondedApplicationsCount / applications
}

function itemWeight(item) {
  return item.applicationsCount ?? item.eligibleMatureApplicationsCount
}

/**
 * A binary, weight-proportional layout. Unlike a CSS grid, each rectangle's
 * area represents the number of applications it contains.
 */
function treemapLayout(items, bounds = { height: 100, width: 100, x: 0, y: 0 }) {
  if (!items.length) return []
  if (items.length === 1) return [{ ...items[0], ...bounds }]

  const total = items.reduce((sum, item) => sum + itemWeight(item), 0)
  let runningWeight = 0
  let splitIndex = 1

  for (let index = 0; index < items.length - 1; index += 1) {
    runningWeight += itemWeight(items[index])
    splitIndex = index + 1
    if (runningWeight >= total / 2) break
  }

  const first = items.slice(0, splitIndex)
  const second = items.slice(splitIndex)
  const firstWeight = first.reduce((sum, item) => sum + itemWeight(item), 0)
  const firstShare = firstWeight / total

  if (bounds.width >= bounds.height) {
    const firstWidth = bounds.width * firstShare
    return [
      ...treemapLayout(first, { ...bounds, width: firstWidth }),
      ...treemapLayout(second, {
        ...bounds,
        width: bounds.width - firstWidth,
        x: bounds.x + firstWidth,
      }),
    ]
  }

  const firstHeight = bounds.height * firstShare
  return [
    ...treemapLayout(first, { ...bounds, height: firstHeight }),
    ...treemapLayout(second, {
      ...bounds,
      height: bounds.height - firstHeight,
      y: bounds.y + firstHeight,
    }),
  ]
}

function tintFor(rate) {
  const accentShare = 12 + Math.round(rate * 50)
  return `color-mix(in srgb, var(--accent) ${accentShare}%, var(--surface))`
}

function Funnel({ copy, locale, row }) {
  const applications = row.eligibleMatureApplicationsCount
  const steps = [
    { label: copy.columns.applications, value: applications },
    { label: copy.columns.response, value: row.respondedApplicationsCount },
    { label: copy.columns.hrScreen, value: row.hrScreenApplicationsCount },
    { label: copy.columns.interview, value: row.interviewedApplicationsCount },
    { label: copy.columns.offer, value: row.offeredApplicationsCount },
    { label: copy.columns.employment, value: row.employmentStartedApplicationsCount },
  ]

  return (
    <ol className="grid gap-0 border-y border-line sm:grid-cols-3 lg:grid-cols-6">
      {steps.map((step) => (
        <li key={step.label} className="min-w-0 border-b border-line p-4 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
          <div className="h-1 bg-line">
            <span
              className="block h-full bg-accent"
              style={{ width: `${applications ? Math.max(3, (step.value / applications) * 100) : 0}%` }}
            />
          </div>
          <p className="mt-3 font-mono text-lg font-bold text-ink">{formatNumber(step.value, locale)}</p>
          <p className="mt-1 font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-muted">{step.label}</p>
        </li>
      ))}
    </ol>
  )
}

function CompanyDetails({ copy, locale, row }) {
  const applications = row.eligibleMatureApplicationsCount
  const qualityMetrics = [
    { label: copy.detail.transparency, value: `${formatScore(row.averageTransparency, locale)}/5` },
    { label: copy.detail.professionalism, value: `${formatScore(row.averageProfessionalism, locale)}/5` },
    { label: copy.detail.feedback, value: formatRate(row.feedbackSharedCount, applications, locale) },
    { label: copy.detail.irrelevant, value: formatRate(row.irrelevantQuestionCount, applications, locale) },
  ]

  return (
    <section className="border-t border-line bg-[var(--surface-muted)] px-5 py-6 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-accentDark">{copy.treemap.selectedEyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-ink">{row.company}</h2>
        </div>
        <p className="font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-muted">
          {interpolateCopy(copy.treemap.contributorCount, { count: formatNumber(row.contributorsCount, locale) })}
        </p>
      </div>

      <div className="mt-5">
        <p className="max-w-3xl text-sm leading-6 text-muted">
          {interpolateCopy(copy.treemap.companyNarrative, {
            applications: formatNumber(applications, locale),
            candidates: formatNumber(row.contributorsCount, locale),
            company: row.company,
            response: formatNumber(row.respondedApplicationsCount, locale),
          })}
        </p>
        <div className="mt-5">
          <Funnel copy={copy} locale={locale} row={row} />
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-muted">{copy.detail.rolesLabel}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {row.roles.map((role) => (
              <div key={role.role} className="border border-line bg-surface p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 text-sm font-semibold text-ink">{role.role}</p>
                  <p className="shrink-0 font-mono text-xs font-bold text-ink">{formatNumber(role.applicationsCount, locale)}</p>
                </div>
                <p className="mt-2 font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-muted">
                  {interpolateCopy(copy.treemap.roleSummary, {
                    response: formatRate(role.respondedApplicationsCount, role.applicationsCount, locale),
                    interview: formatNumber(role.interviewedApplicationsCount, locale),
                    offer: formatNumber(role.offeredApplicationsCount, locale),
                  })}
                </p>
                <p className="mt-3 text-xs leading-5 text-muted">
                  {roleNarrative({ company: row.company, copy, locale, role })}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">{copy.treemap.experienceScopeNote}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-4 lg:w-72 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          {qualityMetrics.map((metric) => (
            <div key={metric.label}>
              <dt className="font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-muted">{metric.label}</dt>
              <dd className="mt-1 font-mono text-base font-bold text-ink">{metric.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="mt-5 text-xs leading-5 text-muted">{copy.detail.note}</p>
    </section>
  )
}

function CompanyTreemap({ copy, locale, onSelect, rows, selectedId }) {
  const layout = useMemo(() => (
    treemapLayout([...rows].toSorted((first, second) => itemWeight(second) - itemWeight(first)))
  ), [rows])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line px-5 py-4 sm:px-6">
        <p className="font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-muted">{copy.treemap.legendArea}</p>
        <p className="font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-muted">{copy.treemap.legendColor}</p>
      </div>
      <div
        className="relative aspect-[4/3] min-h-[24rem] bg-[var(--surface-muted)] sm:aspect-[16/9]"
        role="group"
        aria-label={copy.treemap.ariaLabel}
      >
        {layout.map((company) => {
          const roleLayout = treemapLayout([...company.roles].toSorted((first, second) => itemWeight(second) - itemWeight(first)))
          const isSelected = company.id === selectedId
          const showCompanyLabel = company.width >= 16 && company.height >= 16

          return (
            <button
              key={company.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={interpolateCopy(copy.treemap.companyAria, {
                applications: formatNumber(company.eligibleMatureApplicationsCount, locale),
                company: company.company,
                response: formatRate(company.respondedApplicationsCount, company.eligibleMatureApplicationsCount, locale),
              })}
              onClick={() => onSelect(company.id)}
              className="absolute overflow-hidden border-2 border-[var(--surface-muted)] text-left transition-shadow focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ink aria-pressed:z-10 aria-pressed:border-accentDark aria-pressed:shadow-[inset_0_0_0_1px_var(--accentDark)]"
              style={{
                height: `${company.height}%`,
                left: `${company.x}%`,
                top: `${company.y}%`,
                width: `${company.width}%`,
                backgroundColor: tintFor(responseRate(company)),
              }}
            >
              {roleLayout.map((role) => (
                <span
                  key={role.role}
                  className="absolute border border-[color:color-mix(in_srgb,var(--surface)_65%,transparent)]"
                  style={{
                    height: `${role.height}%`,
                    left: `${role.x}%`,
                    top: `${role.y}%`,
                    width: `${role.width}%`,
                    backgroundColor: tintFor(responseRate(role)),
                  }}
                >
                  {role.width >= 28 && role.height >= 26 ? (
                    <span className="absolute inset-x-2 bottom-2 font-mono text-[7px] font-bold leading-3 text-ink">
                      <span className="block truncate">{role.role}</span>
                      <span>{formatNumber(role.applicationsCount, locale)}</span>
                    </span>
                  ) : null}
                </span>
              ))}
              {showCompanyLabel ? (
                <span className="pointer-events-none absolute inset-x-2 top-2 z-[1]">
                  <span className="block truncate text-sm font-semibold tracking-[-0.02em] text-ink">{company.company}</span>
                  <span className="mt-0.5 block font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-ink">
                    {formatNumber(company.eligibleMatureApplicationsCount, locale)} · {formatRate(company.respondedApplicationsCount, company.eligibleMatureApplicationsCount, locale)}
                  </span>
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SecondaryCompanyFilters({ copy, minimumSample, onMinimumSampleChange }) {
  return (
    <label className="grid gap-1">
      <span className="font-mono text-[8px] font-semibold tracking-[0.04em] text-muted">
        {copy.toolbar.minSampleLabel}
      </span>
      <select
        value={minimumSample}
        onChange={onMinimumSampleChange}
        className="report-filter-control w-full px-1 text-xs font-semibold"
      >
        {MIN_SAMPLE_OPTIONS.map((value) => (
          <option key={value} value={value}>n ≥ {value}</option>
        ))}
      </select>
    </label>
  )
}

export default function CompanyResponsivenessExplorer({ copy, locale, rows }) {
  const componentId = useId().replaceAll(':', '')
  const [activeView, setActiveView] = useState('overview')
  const [query, setQuery] = useState('')
  const [minimumSample, setMinimumSample] = useState(1)
  const [selectedCompanyId, setSelectedCompanyId] = useState(rows[0]?.id ?? null)
  const views = ['overview', 'all']

  const overviewRows = useMemo(() => (
    rows
      .filter((row) => row.eligibleMatureApplicationsCount >= OVERVIEW_SAMPLE_THRESHOLD)
      .toSorted((first, second) => itemWeight(second) - itemWeight(first))
      .slice(0, 12)
  ), [rows])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(localeTag(locale))

    return rows
      .filter((row) => (
        row.contributorsCount >= minimumSample
        && (!normalizedQuery || row.company.toLocaleLowerCase(localeTag(locale)).includes(normalizedQuery))
      ))
      .toSorted((first, second) => itemWeight(second) - itemWeight(first))
  }, [locale, minimumSample, query, rows])

  const visibleRows = activeView === 'overview' ? overviewRows : filteredRows
  const selectedRow = visibleRows.find((row) => row.id === selectedCompanyId) ?? visibleRows[0] ?? null
  const resultCount = formatNumber(filteredRows.length, locale)
  const resultsCopy = copy.toolbar.results.includes('{')
    ? interpolateCopy(copy.toolbar.results, { count: resultCount })
    : `${resultCount} ${copy.toolbar.results}`

  function selectView(view) {
    setActiveView(view)
  }

  return (
    <div className="border border-line bg-surface">
      <div className="border-b border-line px-5 sm:px-6">
        <div role="tablist" aria-label={copy.viewsLabel} className="flex max-w-md gap-8">
          {views.map((view) => (
            <button
              key={view}
              id={`${componentId}-tab-${view}`}
              type="button"
              role="tab"
              aria-controls={`${componentId}-panel-${view}`}
              aria-selected={activeView === view}
              onClick={() => selectView(view)}
              className="report-subtab min-h-12"
            >
              {copy.views[view]}
            </button>
          ))}
        </div>
      </div>

      <section
        id={`${componentId}-panel-${activeView}`}
        role="tabpanel"
        aria-labelledby={`${componentId}-tab-${activeView}`}
      >
        {activeView === 'overview' ? (
          <div className="border-b border-line px-5 py-6 sm:px-6">
            <p className="text-base font-semibold tracking-[-0.02em] text-ink">{copy.summary.heading}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{copy.treemap.description}</p>
          </div>
        ) : (
          <div className="grid gap-5 border-b border-line px-5 py-5 sm:grid-cols-2 sm:px-6">
            <label className="grid gap-1">
              <span className="font-mono text-[8px] font-semibold tracking-[0.04em] text-muted">{copy.toolbar.searchLabel}</span>
              <span className="relative block">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.toolbar.searchPlaceholder}
                  className="report-filter-control w-full pl-9 pr-2 text-xs placeholder:text-muted"
                />
              </span>
            </label>
            <SecondaryCompanyFilters
              copy={copy}
              minimumSample={minimumSample}
              onMinimumSampleChange={(event) => setMinimumSample(Number(event.target.value))}
            />
          </div>
        )}

        {activeView === 'all' ? (
          <div className="flex min-h-12 items-center border-b border-line px-5 sm:px-6">
            <p className="font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-muted" aria-live="polite">{resultsCopy}</p>
          </div>
        ) : null}

        {visibleRows.length ? (
          <>
            <CompanyTreemap
              copy={copy}
              locale={locale}
              rows={visibleRows}
              selectedId={selectedRow?.id}
              onSelect={setSelectedCompanyId}
            />
            {selectedRow ? <CompanyDetails copy={copy} locale={locale} row={selectedRow} /> : null}
          </>
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="text-lg font-semibold tracking-[-0.02em] text-ink">{copy.empty.title}</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{copy.empty.description}</p>
          </div>
        )}
      </section>

      <ReportMethodology label={copy.methodologyLabel} text={copy.methodology} />
    </div>
  )
}
