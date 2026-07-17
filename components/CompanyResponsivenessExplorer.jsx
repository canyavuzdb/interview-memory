'use client'

import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import {
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import ReportMethodology from './ReportMethodology'

const MIN_SAMPLE_OPTIONS = [10, 25, 50]
const PAGE_SIZE_OPTIONS = [10, 25, 50]
const OVERVIEW_SAMPLE_THRESHOLD = 10

function localeTag(locale) {
  return locale === 'tr' ? 'tr-TR' : 'en-US'
}

function formatNumber(value, locale) {
  return new Intl.NumberFormat(localeTag(locale)).format(value)
}

function formatRate(numerator, denominator, locale, minimumSample = OVERVIEW_SAMPLE_THRESHOLD) {
  if (!denominator || denominator < minimumSample) return '—'

  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(numerator / denominator)
}

function formatPercentValue(value, locale) {
  if (value === null) return '—'

  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value)
}

function median(values) {
  if (!values.length) return null

  const ordered = [...values].sort((first, second) => first - second)
  const middle = Math.floor(ordered.length / 2)

  return ordered.length % 2 === 0
    ? (ordered[middle - 1] + ordered[middle]) / 2
    : ordered[middle]
}

function interpolateCopy(template, values) {
  if (typeof template !== 'string') return ''

  return template.replace(/\{\{?(\w+)\}?\}/g, (match, key) => (
    Object.hasOwn(values, key) ? values[key] : match
  ))
}

function denominatorFor(row, metric) {
  if (metric === 'postInterview') return row.interviewedApplicationsCount
  if (metric === 'sample') return row.contributorsCount

  return row.eligibleMatureApplicationsCount
}

function noResponseRate(row) {
  if (!row.eligibleMatureApplicationsCount) return -1
  return row.noSubstantiveUpdateCount / row.eligibleMatureApplicationsCount
}

function postInterviewRate(row) {
  if (!row.interviewedApplicationsCount) return -1
  return row.postInterviewNoFollowUpCount / row.interviewedApplicationsCount
}

function rateBarWidth(row) {
  return `${Math.max(0, Math.min(100, Math.round(noResponseRate(row) * 100)))}%`
}

function CompanyTable({
  copy,
  locale,
  minimumDisplaySample,
  rankOffset = 0,
  rows,
}) {
  return (
    <div
      className="hidden overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent md:block"
      tabIndex="0"
      aria-label={copy.tableScrollLabel}
    >
      <table className="w-full min-w-[850px] border-collapse">
        <caption className="sr-only">{copy.tableCaption}</caption>
        <thead>
          <tr className="border-b border-line">
            {[
              copy.columns.rank,
              copy.columns.company,
              copy.columns.noResponse,
              copy.columns.postInterview,
              copy.columns.sample,
            ].map((label, index) => (
              <th
                key={label}
                scope="col"
                className={`px-5 py-3 font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-muted ${
                  index < 2 ? 'text-left' : 'text-right'
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className="h-[68px] border-b border-line last:border-b-0"
            >
              <td className="w-16 px-5 py-4 font-mono text-[9px] font-bold text-muted">
                {String(rankOffset + index + 1).padStart(2, '0')}
              </td>
              <th scope="row" className="min-w-56 px-5 py-4 text-left">
                <p className="text-sm font-semibold text-ink">{row.company}</p>
                <div className="mt-2 h-px max-w-52 bg-line">
                  <span
                    className="block h-full bg-accent"
                    style={{ width: rateBarWidth(row) }}
                  />
                </div>
              </th>
              <td className="px-5 py-4 text-right">
                <p className="font-mono text-sm font-semibold text-ink">
                  {formatRate(
                    row.noSubstantiveUpdateCount,
                    row.eligibleMatureApplicationsCount,
                    locale,
                    minimumDisplaySample,
                  )}
                </p>
                <p className="sr-only">
                  {formatNumber(row.noSubstantiveUpdateCount, locale)}/
                  {formatNumber(row.eligibleMatureApplicationsCount, locale)}
                </p>
              </td>
              <td className="px-5 py-4 text-right">
                <p className="font-mono text-sm font-semibold text-ink">
                  {formatRate(
                    row.postInterviewNoFollowUpCount,
                    row.interviewedApplicationsCount,
                    locale,
                    minimumDisplaySample,
                  )}
                </p>
                <p className="sr-only">
                  {formatNumber(row.postInterviewNoFollowUpCount, locale)}/
                  {formatNumber(row.interviewedApplicationsCount, locale)}
                </p>
              </td>
              <td className="px-5 py-4 text-right font-mono text-xs font-bold text-muted">
                {formatNumber(row.contributorsCount, locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CompanyCards({
  copy,
  locale,
  minimumDisplaySample,
  rankOffset = 0,
  rows,
}) {
  return (
    <ol className="divide-y divide-line md:hidden">
      {rows.map((row, index) => (
        <li key={row.id} className="p-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="min-w-0 text-sm font-semibold text-ink">
              <span className="mr-2 font-mono text-[8px] text-muted">
                {String(rankOffset + index + 1).padStart(2, '0')}
              </span>
              {row.company}
            </p>
            <span className="shrink-0 font-mono text-[8px] font-bold text-muted">
              n={formatNumber(row.contributorsCount, locale)}
            </span>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-5 border-t border-line pt-4">
            <div>
              <dt className="font-mono text-[7px] font-bold uppercase leading-3 tracking-[0.05em] text-muted">
                {copy.columns.noResponse}
              </dt>
              <dd className="mt-1.5 font-mono text-base font-bold text-ink">
                {formatRate(
                  row.noSubstantiveUpdateCount,
                  row.eligibleMatureApplicationsCount,
                  locale,
                  minimumDisplaySample,
                )}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[7px] font-bold uppercase leading-3 tracking-[0.05em] text-muted">
                {copy.columns.postInterview}
              </dt>
              <dd className="mt-1.5 font-mono text-base font-bold text-ink">
                {formatRate(
                  row.postInterviewNoFollowUpCount,
                  row.interviewedApplicationsCount,
                  locale,
                  minimumDisplaySample,
                )}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  )
}

function CompanyRows(props) {
  return (
    <>
      <CompanyTable {...props} />
      <CompanyCards {...props} />
    </>
  )
}

function SecondaryCompanyFilters({
  copy,
  minimumSample,
  onMinimumSampleChange,
  onPageSizeChange,
  pageSize,
}) {
  return (
    <details className="group relative sm:col-span-2 lg:col-span-1 lg:justify-self-end">
      <summary className="report-filter-summary flex min-h-10 cursor-pointer list-none items-center gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
        <SlidersHorizontal size={13} strokeWidth={1.7} aria-hidden="true" />
        {copy.toolbar.filtersLabel}
        <span className="font-mono text-[7px] font-bold text-accentDark">
          n≥{minimumSample} · {pageSize}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={1.7}
          aria-hidden="true"
          className="ml-auto transition-transform duration-200 group-open:rotate-180 lg:ml-1"
        />
      </summary>

      <div className="report-filter-popover z-30 mt-2 grid grid-cols-2 gap-5 p-4 lg:absolute lg:right-0 lg:top-full lg:w-72">
        <label className="grid gap-1">
          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-muted">
            {copy.toolbar.minSampleLabel}
          </span>
          <select
            value={minimumSample}
            onChange={onMinimumSampleChange}
            className="report-filter-control w-full px-1 font-mono text-xs font-semibold"
          >
            {MIN_SAMPLE_OPTIONS.map((value) => (
              <option key={value} value={value}>n ≥ {value}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-muted">
            {copy.toolbar.pageSizeLabel}
          </span>
          <select
            value={pageSize}
            onChange={onPageSizeChange}
            className="report-filter-control w-full px-1 font-mono text-xs font-semibold"
          >
            {PAGE_SIZE_OPTIONS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
    </details>
  )
}

export default function CompanyResponsivenessExplorer({ copy, locale, rows }) {
  const componentId = useId().replaceAll(':', '')
  const tabRefs = useRef([])
  const [activeView, setActiveView] = useState('overview')
  const [query, setQuery] = useState('')
  const [sortMetric, setSortMetric] = useState('noResponse')
  const [minimumSample, setMinimumSample] = useState(10)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const views = ['overview', 'all']

  const collator = useMemo(() => new Intl.Collator(localeTag(locale), {
    numeric: true,
    sensitivity: 'base',
  }), [locale])

  const overviewRows = useMemo(() => (
    rows
      .filter((row) => row.eligibleMatureApplicationsCount >= OVERVIEW_SAMPLE_THRESHOLD)
      .toSorted((first, second) => (
        noResponseRate(second) - noResponseRate(first)
        || collator.compare(first.company, second.company)
      ))
      .slice(0, 5)
  ), [collator, rows])

  const summary = useMemo(() => {
    const eligibleRows = rows.filter(
      (row) => row.eligibleMatureApplicationsCount >= OVERVIEW_SAMPLE_THRESHOLD,
    )
    const applications = eligibleRows.reduce(
      (total, row) => total + row.eligibleMatureApplicationsCount,
      0,
    )
    const noUpdateRates = eligibleRows.map(noResponseRate)

    return {
      applications,
      companies: eligibleRows.length,
      medianNoUpdate: median(noUpdateRates),
    }
  }, [rows])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(localeTag(locale))

    return rows
      .filter((row) => (
        denominatorFor(row, sortMetric) >= minimumSample
        && (
          !normalizedQuery
          || row.company.toLocaleLowerCase(localeTag(locale)).includes(normalizedQuery)
        )
      ))
      .toSorted((first, second) => {
        if (sortMetric === 'company') {
          return collator.compare(first.company, second.company)
        }

        let difference

        if (sortMetric === 'postInterview') {
          difference = postInterviewRate(second) - postInterviewRate(first)
        } else if (sortMetric === 'sample') {
          difference = second.contributorsCount - first.contributorsCount
        } else {
          difference = noResponseRate(second) - noResponseRate(first)
        }

        return difference || collator.compare(first.company, second.company)
      })
  }, [collator, locale, minimumSample, query, rows, sortMetric])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * pageSize
  const pageRows = filteredRows.slice(pageStart, pageStart + pageSize)
  const visibleStart = filteredRows.length ? pageStart + 1 : 0
  const visibleEnd = Math.min(pageStart + pageSize, filteredRows.length)

  function selectView(view, focusTab = false) {
    setActiveView(view)

    if (focusTab) {
      const index = views.indexOf(view)
      window.requestAnimationFrame(() => tabRefs.current[index]?.focus())
    }
  }

  function handleTabKeyDown(event, index) {
    let nextIndex

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % views.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + views.length) % views.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = views.length - 1
    } else {
      return
    }

    event.preventDefault()
    selectView(views[nextIndex], true)
  }

  function updateSortMetric(value) {
    setSortMetric(value)
    setPage(1)
  }

  function updateMinimumSample(value) {
    setMinimumSample(Number(value))
    setPage(1)
  }

  function updatePageSize(value) {
    setPageSize(Number(value))
    setPage(1)
  }

  const formattedResults = {
    count: formatNumber(filteredRows.length, locale),
    end: formatNumber(visibleEnd, locale),
    filtered: formatNumber(filteredRows.length, locale),
    start: formatNumber(visibleStart, locale),
    total: formatNumber(rows.length, locale),
    visible: formatNumber(pageRows.length, locale),
  }
  const resultsCopy = copy.toolbar.results.includes('{')
    ? interpolateCopy(copy.toolbar.results, formattedResults)
    : `${formattedResults.filtered} ${copy.toolbar.results}`
  const formattedPage = {
    current: formatNumber(currentPage, locale),
    page: formatNumber(currentPage, locale),
    total: formatNumber(pageCount, locale),
  }
  const pageCopy = copy.pagination.page.includes('{')
    ? interpolateCopy(copy.pagination.page, formattedPage)
    : `${copy.pagination.page} ${formattedPage.current} / ${formattedPage.total}`
  const viewAllCopy = interpolateCopy(copy.summary.viewAll, {
    count: formatNumber(rows.length, locale),
  })
  return (
    <div className="border border-line bg-surface">
      <div className="border-b border-line px-5 sm:px-6">
        <div
          role="tablist"
          aria-label={copy.viewsLabel}
          className="flex max-w-md gap-8"
        >
          {views.map((view, index) => {
            const active = activeView === view

            return (
              <button
                key={view}
                ref={(element) => {
                  tabRefs.current[index] = element
                }}
                id={`${componentId}-tab-${view}`}
                type="button"
                role="tab"
                tabIndex={active ? 0 : -1}
                aria-controls={`${componentId}-panel-${view}`}
                aria-selected={active}
                onClick={() => selectView(view)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className="report-subtab min-h-12"
              >
                {copy.views[view]}
              </button>
            )
          })}
        </div>
      </div>

      <section
        id={`${componentId}-panel-overview`}
        role="tabpanel"
        aria-labelledby={`${componentId}-tab-overview`}
        hidden={activeView !== 'overview'}
      >
        <div className="border-b border-line p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-base font-semibold tracking-[-0.02em] text-ink">
                {copy.summary.heading}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                {copy.summary.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => selectView('all', true)}
              className="report-action justify-self-start lg:justify-self-end"
            >
              {viewAllCopy}
              <ArrowRight size={13} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </div>

          <dl className="mt-7 grid gap-6 border-t border-line pt-5 sm:grid-cols-3">
            {[
              {
                label: copy.summary.companies,
                value: formatNumber(summary.companies, locale),
              },
              {
                label: copy.summary.applications,
                value: formatNumber(summary.applications, locale),
              },
              {
                label: copy.summary.medianNoUpdate,
                value: formatPercentValue(summary.medianNoUpdate, locale),
              },
            ].map((item) => (
              <div key={item.label}>
                <dt className="font-mono text-[7px] font-bold uppercase tracking-[0.07em] text-muted">
                  {item.label}
                </dt>
                <dd className="mt-1.5 font-mono text-lg font-bold tracking-[-0.03em] text-ink">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <CompanyRows
          copy={copy}
          locale={locale}
          minimumDisplaySample={OVERVIEW_SAMPLE_THRESHOLD}
          rows={overviewRows}
        />
      </section>

      <section
        id={`${componentId}-panel-all`}
        role="tabpanel"
        aria-labelledby={`${componentId}-tab-all`}
        hidden={activeView !== 'all'}
      >
        <div className="grid gap-5 border-b border-line px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-[minmax(15rem,1fr)_15rem_auto] lg:items-end">
          <label className="grid gap-1">
            <span className="font-mono text-[8px] font-semibold tracking-[0.04em] text-muted">
              {copy.toolbar.searchLabel}
            </span>
            <span className="relative block">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder={copy.toolbar.searchPlaceholder}
                className="report-filter-control w-full pl-9 pr-2 text-xs placeholder:text-muted"
              />
            </span>
          </label>

          <label className="grid gap-1">
            <span className="font-mono text-[8px] font-semibold tracking-[0.04em] text-muted">
              {copy.toolbar.sortLabel}
            </span>
            <select
              value={sortMetric}
              onChange={(event) => updateSortMetric(event.target.value)}
              className="report-filter-control w-full px-1 text-xs font-semibold"
            >
              {['noResponse', 'postInterview', 'sample', 'company'].map((metric) => (
                <option key={metric} value={metric}>{copy.sort[metric]}</option>
              ))}
            </select>
          </label>

          <SecondaryCompanyFilters
            copy={copy}
            minimumSample={minimumSample}
            onMinimumSampleChange={(event) => updateMinimumSample(event.target.value)}
            onPageSizeChange={(event) => updatePageSize(event.target.value)}
            pageSize={pageSize}
          />
        </div>

        <div className="flex min-h-12 items-center border-b border-line px-5 sm:px-6">
          <p
            className="font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-muted"
            aria-live="polite"
          >
            {resultsCopy}
          </p>
        </div>

        {pageRows.length > 0 ? (
          <CompanyRows
            copy={copy}
            locale={locale}
            minimumDisplaySample={minimumSample}
            rankOffset={pageStart}
            rows={pageRows}
          />
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="text-lg font-semibold tracking-[-0.02em] text-ink">{copy.empty.title}</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{copy.empty.description}</p>
          </div>
        )}

        <nav
          aria-label={copy.pagination.label}
          className="grid min-h-14 grid-cols-[1fr_auto_1fr] items-center border-t border-line px-3 sm:px-5"
        >
          <button
            type="button"
            disabled={currentPage <= 1 || filteredRows.length === 0}
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            className="inline-flex min-h-11 items-center gap-2 justify-self-start px-2 font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-ink transition-colors hover:text-accentDark disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            <span className="hidden sm:inline">{copy.pagination.previous}</span>
          </button>
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-muted">
            {pageCopy}
          </p>
          <button
            type="button"
            disabled={currentPage >= pageCount || filteredRows.length === 0}
            onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
            className="inline-flex min-h-11 items-center gap-2 justify-self-end px-2 font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-ink transition-colors hover:text-accentDark disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span className="hidden sm:inline">{copy.pagination.next}</span>
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </nav>
      </section>

      <ReportMethodology
        label={copy.methodologyLabel}
        text={copy.methodology}
      />
    </div>
  )
}
