'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import ReportMethodology from './ReportMethodology'

const BENCHMARK_MIN_SAMPLE_OPTIONS = [10, 25, 50]
const BENCHMARK_PAGE_SIZE_OPTIONS = [10, 25, 50]

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

function interpolateCopy(template, values) {
  if (typeof template !== 'string') return ''

  return template.replace(/\{\{?(\w+)\}?\}/g, (match, key) => (
    Object.hasOwn(values, key) ? values[key] : match
  ))
}

function formatMonth(value, locale) {
  const [year, month] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, 1))

  return new Intl.DateTimeFormat(localeTag(locale), {
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

function formatSalary(row, meta, copy, locale) {
  if (row.acceptedSalarySampleSize < meta.minSalarySampleSize) {
    return copy.table.suppressed
  }

  const { currency, max, min } = row.medianAcceptedSalary
  const formatter = new Intl.NumberFormat(localeTag(locale), {
    compactDisplay: 'short',
    currency,
    maximumFractionDigits: 0,
    notation: 'compact',
    style: 'currency',
  })

  return max
    ? `${formatter.format(min)}–${formatter.format(max)}`
    : `${formatter.format(min)}+`
}

function roleApplications(row) {
  return row.monthlyApplications.reduce((total, item) => total + item.count, 0)
}

function roleLabel(row, copy) {
  if (!row.roleSpecialization) {
    return copy.roles[row.roleFamily] ?? row.roleFamily
  }

  const specialization = copy.roleSpecializations[row.roleSpecialization]
    ?? row.roleSpecialization
  const seniority = copy.roleSeniorities[row.seniority] ?? row.seniority

  return interpolateCopy(copy.roleLabelTemplate, {
    seniority,
    specialization,
  })
}

function getTrend(values, copy) {
  const first = values[0] ?? 0
  const last = values.at(-1) ?? 0
  const change = first > 0 ? (last - first) / first : 0

  if (change > 0.05) return { label: copy.trend.up, mark: '↗' }
  if (change < -0.05) return { label: copy.trend.down, mark: '↘' }
  return { label: copy.trend.steady, mark: '→' }
}

function MiniTrend({ copy, values }) {
  const highestValue = Math.max(...values, 1)
  const trend = getTrend(values, copy)

  return (
    <div aria-label={trend.label} title={trend.label}>
      <span className="flex h-7 items-end gap-[3px]" aria-hidden="true">
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className={`w-[4px] ${index === values.length - 1 ? 'bg-accent' : 'bg-[var(--line-emphasis)]'}`}
            style={{ height: `${Math.max(18, Math.round((value / highestValue) * 100))}%` }}
          />
        ))}
      </span>
    </div>
  )
}

function RateCell({ count, denominator, locale }) {
  return (
    <div className="whitespace-nowrap">
      <span className="font-mono text-xs font-semibold text-ink">
        {formatPercent(count, denominator, locale)}
      </span>
      <span className="sr-only"> · {formatNumber(count, locale)}</span>
    </div>
  )
}

function RoleTable({ copy, locale, rows }) {
  const months = rows[0]?.monthlyApplications.map((item) => item.month) ?? []

  return (
    <div
      className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
      tabIndex="0"
      aria-label={copy.table.scrollLabel}
    >
      <table className="w-full min-w-[1040px] border-collapse xl:min-w-[900px] 2xl:min-w-[1040px]">
        <caption className="sr-only">{copy.table.rolesCaption}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="sticky left-0 z-10 min-w-48 bg-surface px-4 py-3 text-left font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted xl:min-w-40 2xl:min-w-48">
              {copy.table.role}
            </th>
            <th scope="col" className="min-w-24 px-3 py-3 text-left font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted xl:min-w-20 2xl:min-w-24">
              {copy.table.trend}
            </th>
            {months.map((month) => (
              <th key={month} scope="col" className="min-w-16 px-3 py-3 text-right font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted xl:min-w-14 2xl:min-w-16">
                {formatMonth(month, locale)}
              </th>
            ))}
            <th scope="col" className="min-w-24 px-3 py-3 text-right font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-muted xl:min-w-20 2xl:min-w-24">
              {copy.table.responseRate}
            </th>
            <th scope="col" className="min-w-24 px-3 py-3 text-right font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-muted xl:min-w-20 2xl:min-w-24">
              {copy.table.interviewRate}
            </th>
            <th scope="col" className="min-w-24 px-3 py-3 text-right font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-muted xl:min-w-20 2xl:min-w-24">
              {copy.table.employmentRate}
            </th>
            <th scope="col" className="min-w-16 px-4 py-3 text-right font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted xl:min-w-14 2xl:min-w-16">
              {copy.table.sample}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const applications = roleApplications(row)
            const values = row.monthlyApplications.map((item) => item.count)

            return (
              <tr key={row.id} className="h-16 border-b border-line last:border-b-0">
                <th scope="row" className="sticky left-0 z-10 bg-surface px-4 py-4 text-left text-sm font-semibold text-ink [background-clip:padding-box]">
                  {roleLabel(row, copy)}
                </th>
                <td className="px-3 py-3"><MiniTrend copy={copy} values={values} /></td>
                {row.monthlyApplications.map((item) => (
                  <td key={item.month} className="px-3 py-3 text-right font-mono text-xs font-bold text-ink">
                    {formatNumber(item.count, locale)}
                  </td>
                ))}
                <td className="px-3 py-3 text-right font-mono text-xs font-bold text-ink">
                  {formatPercent(row.responsesCount, applications, locale)}
                </td>
                <td className="px-3 py-3 text-right font-mono text-xs font-bold text-ink">
                  {formatPercent(row.interviewsCount, applications, locale)}
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="block font-mono text-xs font-bold text-accentDark">
                    {formatPercent(row.employmentStartedCount, row.matureSearchEpisodesCount, locale)}
                  </span>
                  <span className="sr-only">
                    {row.employmentStartedCount}/{row.matureSearchEpisodesCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs font-bold text-muted">
                  {formatNumber(row.uniqueCandidates, locale)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CompanyTable({ copy, locale, meta, rows }) {
  return (
    <div
      className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
      tabIndex="0"
      aria-label={copy.table.scrollLabel}
    >
      <table className="w-full min-w-[900px] border-collapse">
        <caption className="sr-only">{copy.table.companiesCaption}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="sticky left-0 z-10 min-w-48 bg-surface px-4 py-3 text-left font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted">
              {copy.table.company}
            </th>
            <th scope="col" className="min-w-24 px-3 py-3 text-left font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted">
              {copy.table.trend}
            </th>
            {[copy.table.applications, copy.table.response, copy.table.interview, copy.table.offer, copy.table.employmentStarted].map((label) => (
              <th key={label} scope="col" className="min-w-24 px-3 py-3 text-right font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
                {label}
              </th>
            ))}
            <th scope="col" className="min-w-32 px-3 py-3 text-right font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
              {copy.table.salary}
            </th>
            <th scope="col" className="min-w-16 px-4 py-3 text-right font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted">
              {copy.table.sample}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="h-16 border-b border-line last:border-b-0">
              <th scope="row" className="sticky left-0 z-10 bg-surface px-4 py-4 text-left text-sm font-semibold text-ink [background-clip:padding-box]">
                {row.company}
              </th>
              <td className="px-3 py-3"><MiniTrend copy={copy} values={row.monthlyApplications} /></td>
              <td className="px-3 py-3 text-right font-mono text-xs font-bold text-ink">
                {formatNumber(row.applicationsCount, locale)}
              </td>
              <td className="px-3 py-3 text-right"><RateCell count={row.responsesCount} denominator={row.applicationsCount} locale={locale} /></td>
              <td className="px-3 py-3 text-right"><RateCell count={row.interviewsCount} denominator={row.applicationsCount} locale={locale} /></td>
              <td className="px-3 py-3 text-right"><RateCell count={row.offersCount} denominator={row.applicationsCount} locale={locale} /></td>
              <td className="px-3 py-3 text-right"><RateCell count={row.employmentStartedCount} denominator={row.applicationsCount} locale={locale} /></td>
              <td className="px-3 py-3 text-right font-mono text-[10px] font-bold text-ink">
                <span className={row.acceptedSalarySampleSize < meta.minSalarySampleSize ? 'text-muted' : ''}>
                  {formatSalary(row, meta, copy, locale)}
                </span>
                <span className="sr-only">n={row.acceptedSalarySampleSize}</span>
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs font-bold text-muted">
                {formatNumber(row.uniqueCandidates, locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RoleMobileCards({ copy, locale, rows }) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => {
        const applications = roleApplications(row)
        const values = row.monthlyApplications.map((item) => item.count)

        return (
          <li key={row.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-ink">{roleLabel(row, copy)}</p>
                <p className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted">
                  n={formatNumber(row.uniqueCandidates, locale)}
                </p>
              </div>
              <MiniTrend copy={copy} values={values} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-5 border-t border-line pt-4">
              <MobileMetric label={copy.table.applications} value={formatNumber(applications, locale)} />
              <MobileMetric label={copy.table.interviewRate} value={formatPercent(row.interviewsCount, applications, locale)} />
              <MobileMetric label={copy.table.employmentRate} value={formatPercent(row.employmentStartedCount, row.matureSearchEpisodesCount, locale)} />
            </div>
            <div className="mt-5 grid grid-cols-6 gap-2 border-t border-line pt-4" aria-label={copy.table.monthlyApplications}>
              {row.monthlyApplications.map((item) => (
                <div key={item.month} className="px-1 py-1 text-center">
                  <p className="font-mono text-[8px] font-bold uppercase text-muted">{formatMonth(item.month, locale)}</p>
                  <p className="mt-1 font-mono text-[10px] font-bold text-ink">{formatNumber(item.count, locale)}</p>
                </div>
              ))}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function MobileMetric({ label, value }) {
  return (
    <div className="min-w-0 text-left">
      <p className="font-mono text-sm font-bold text-ink">{value}</p>
      <p className="mt-1 font-mono text-[7px] font-bold uppercase leading-3 tracking-[0.04em] text-muted">{label}</p>
    </div>
  )
}

function SecondaryFilters({
  controls,
  minimumSample,
  onMinimumSampleChange,
  onPageSizeChange,
  pageSize,
}) {
  return (
    <details className="group relative sm:col-span-2 lg:col-span-1 lg:justify-self-end">
      <summary className="report-filter-summary flex min-h-10 cursor-pointer list-none items-center gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
        <SlidersHorizontal size={13} strokeWidth={1.7} aria-hidden="true" />
        {controls.filtersLabel}
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
            {controls.minSampleLabel}
          </span>
          <select
            value={minimumSample}
            onChange={onMinimumSampleChange}
            className="report-filter-control w-full px-1 font-mono text-xs font-semibold"
          >
            {BENCHMARK_MIN_SAMPLE_OPTIONS.map((value) => (
              <option key={value} value={value}>n ≥ {value}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="font-mono text-[7px] font-bold uppercase tracking-[0.06em] text-muted">
            {controls.pageSizeLabel}
          </span>
          <select
            value={pageSize}
            onChange={onPageSizeChange}
            className="report-filter-control w-full px-1 font-mono text-xs font-semibold"
          >
            {BENCHMARK_PAGE_SIZE_OPTIONS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
    </details>
  )
}

function CompanyMobileCards({ copy, locale, meta, rows }) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => (
        <li key={row.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-ink">{row.company}</p>
              <p className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted">
                n={formatNumber(row.uniqueCandidates, locale)}
              </p>
            </div>
            <MiniTrend copy={copy} values={row.monthlyApplications} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-line pt-4 sm:grid-cols-4">
            <MobileMetric label={copy.table.applications} value={formatNumber(row.applicationsCount, locale)} />
            <MobileMetric label={copy.table.response} value={formatPercent(row.responsesCount, row.applicationsCount, locale)} />
            <MobileMetric label={copy.table.interview} value={formatPercent(row.interviewsCount, row.applicationsCount, locale)} />
            <MobileMetric label={copy.table.employmentStarted} value={formatPercent(row.employmentStartedCount, row.applicationsCount, locale)} />
          </div>
          <p className="mt-4 flex items-center justify-between gap-4 font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-muted">
            <span>{copy.table.salary}</span>
            <span className="text-right text-[10px] text-ink">{formatSalary(row, meta, copy, locale)}</span>
          </p>
        </li>
      ))}
    </ul>
  )
}

function roleMetric(row, metric) {
  const applications = roleApplications(row)

  if (metric === 'applications') return applications
  if (metric === 'candidates') return row.uniqueCandidates
  if (metric === 'response') {
    return applications ? row.responsesCount / applications : -1
  }
  if (metric === 'interview') {
    return applications ? row.interviewsCount / applications : -1
  }
  if (metric === 'employment') {
    return row.matureSearchEpisodesCount
      ? row.employmentStartedCount / row.matureSearchEpisodesCount
      : -1
  }

  return -1
}

function RoleDataExplorer({ copy, locale, meta, rows }) {
  const controls = copy.roleExplorer
  const [query, setQuery] = useState('')
  const [sortMetric, setSortMetric] = useState('applications')
  const [minimumSample, setMinimumSample] = useState(meta.minPublicCohortSize)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const collator = useMemo(() => new Intl.Collator(localeTag(locale), {
    numeric: true,
    sensitivity: 'base',
  }), [locale])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(localeTag(locale))

    return rows
      .map((row) => ({
        familyLabel: copy.roles[row.roleFamily] ?? row.roleFamily,
        label: roleLabel(row, copy),
        row,
      }))
      .filter(({ familyLabel, label, row }) => (
        row.uniqueCandidates >= minimumSample
        && (
          !normalizedQuery
          || label.toLocaleLowerCase(localeTag(locale)).includes(normalizedQuery)
          || familyLabel.toLocaleLowerCase(localeTag(locale)).includes(normalizedQuery)
        )
      ))
      .toSorted((first, second) => {
        if (sortMetric === 'role') {
          return collator.compare(first.label, second.label)
        }

        return (
          roleMetric(second.row, sortMetric) - roleMetric(first.row, sortMetric)
          || second.row.uniqueCandidates - first.row.uniqueCandidates
          || collator.compare(first.label, second.label)
        )
      })
      .map(({ row }) => row)
  }, [collator, copy, locale, minimumSample, query, rows, sortMetric])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * pageSize
  const pageRows = filteredRows.slice(pageStart, pageStart + pageSize)
  const visibleStart = filteredRows.length ? pageStart + 1 : 0
  const visibleEnd = Math.min(pageStart + pageSize, filteredRows.length)
  const resultsCopy = interpolateCopy(controls.results, {
    count: formatNumber(filteredRows.length, locale),
    total: formatNumber(rows.length, locale),
  })
  const pageCopy = interpolateCopy(controls.pagination.page, {
    current: formatNumber(currentPage, locale),
    total: formatNumber(pageCount, locale),
  })

  function resetPageAnd(update) {
    update()
    setPage(1)
  }

  function resetFilters() {
    setQuery('')
    setSortMetric('applications')
    setMinimumSample(meta.minPublicCohortSize)
    setPageSize(10)
    setPage(1)
  }

  return (
    <section aria-label={controls.label}>
      <div className="grid gap-5 border-b border-line px-5 py-5 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1fr)_15rem_auto] lg:items-end sm:px-6">
        <label className="grid gap-1">
          <span className="font-mono text-[8px] font-semibold tracking-[0.04em] text-muted">
            {controls.searchLabel}
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
              onChange={(event) => resetPageAnd(() => setQuery(event.target.value))}
              placeholder={controls.searchPlaceholder}
              className="report-filter-control w-full pl-9 pr-2 text-xs placeholder:text-muted"
            />
          </span>
        </label>

        <label className="grid gap-1">
          <span className="font-mono text-[8px] font-semibold tracking-[0.04em] text-muted">
            {controls.sortLabel}
          </span>
          <select
            value={sortMetric}
            onChange={(event) => resetPageAnd(() => setSortMetric(event.target.value))}
            className="report-filter-control w-full px-1 text-xs font-semibold"
          >
            {[
              'applications',
              'response',
              'interview',
              'employment',
              'candidates',
              'role',
            ].map((metric) => (
              <option key={metric} value={metric}>{controls.sort[metric]}</option>
            ))}
          </select>
        </label>

        <SecondaryFilters
          controls={controls}
          minimumSample={minimumSample}
          onMinimumSampleChange={(event) => resetPageAnd(
            () => setMinimumSample(Number(event.target.value)),
          )}
          onPageSizeChange={(event) => resetPageAnd(
            () => setPageSize(Number(event.target.value)),
          )}
          pageSize={pageSize}
        />
      </div>

      <div className="flex min-h-11 items-center justify-between gap-4 border-b border-line px-5">
        <p
          className="font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-muted"
          aria-live="polite"
        >
          {resultsCopy}
        </p>
        {filteredRows.length > 0 && (
          <p className="font-mono text-[8px] font-bold tracking-[0.06em] text-muted">
            {formatNumber(visibleStart, locale)}–{formatNumber(visibleEnd, locale)}
          </p>
        )}
      </div>

      {pageRows.length > 0 ? (
        <>
          <div className="hidden md:block">
            <RoleTable copy={copy} locale={locale} rows={pageRows} />
          </div>
          <div className="md:hidden">
            <RoleMobileCards copy={copy} locale={locale} rows={pageRows} />
          </div>
        </>
      ) : (
        <div className="px-6 py-16 text-center">
          <p className="text-lg font-semibold tracking-[-0.02em] text-ink">
            {controls.empty.title}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            {controls.empty.description}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="report-action mt-4"
          >
            {controls.empty.reset}
          </button>
        </div>
      )}

      <nav
        aria-label={controls.pagination.label}
        className="grid min-h-14 grid-cols-[1fr_auto_1fr] items-center border-t border-line px-3 sm:px-5"
      >
        <button
          type="button"
          disabled={currentPage <= 1 || filteredRows.length === 0}
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          className="inline-flex min-h-11 items-center gap-2 justify-self-start px-2 font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-ink transition-colors hover:text-accentDark disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          <span className="hidden sm:inline">{controls.pagination.previous}</span>
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
          <span className="hidden sm:inline">{controls.pagination.next}</span>
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </nav>
    </section>
  )
}

function companyRate(row, metric) {
  if (!row.applicationsCount) return -1

  if (metric === 'response') return row.responsesCount / row.applicationsCount
  if (metric === 'interview') return row.interviewsCount / row.applicationsCount
  if (metric === 'offer') return row.offersCount / row.applicationsCount
  if (metric === 'employment') {
    return row.employmentStartedCount / row.applicationsCount
  }

  return -1
}

function CompanyFunnelExplorer({ copy, locale, meta, rows }) {
  const controls = copy.companyExplorer
  const [query, setQuery] = useState('')
  const [sortMetric, setSortMetric] = useState('applications')
  const [minimumSample, setMinimumSample] = useState(meta.minPublicCohortSize)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const collator = useMemo(() => new Intl.Collator(localeTag(locale), {
    numeric: true,
    sensitivity: 'base',
  }), [locale])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(localeTag(locale))

    return rows
      .filter((row) => (
        row.uniqueCandidates >= minimumSample
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

        if (sortMetric === 'applications') {
          difference = second.applicationsCount - first.applicationsCount
        } else if (sortMetric === 'candidates') {
          difference = second.uniqueCandidates - first.uniqueCandidates
        } else {
          difference = companyRate(second, sortMetric) - companyRate(first, sortMetric)
        }

        return (
          difference
          || second.uniqueCandidates - first.uniqueCandidates
          || collator.compare(first.company, second.company)
        )
      })
  }, [collator, locale, minimumSample, query, rows, sortMetric])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * pageSize
  const pageRows = filteredRows.slice(pageStart, pageStart + pageSize)
  const visibleStart = filteredRows.length ? pageStart + 1 : 0
  const visibleEnd = Math.min(pageStart + pageSize, filteredRows.length)
  const resultsCopy = interpolateCopy(controls.results, {
    count: formatNumber(filteredRows.length, locale),
    total: formatNumber(rows.length, locale),
  })
  const pageCopy = interpolateCopy(controls.pagination.page, {
    current: formatNumber(currentPage, locale),
    total: formatNumber(pageCount, locale),
  })

  function resetPageAnd(update) {
    update()
    setPage(1)
  }

  function resetFilters() {
    setQuery('')
    setSortMetric('applications')
    setMinimumSample(meta.minPublicCohortSize)
    setPageSize(10)
    setPage(1)
  }

  return (
    <section aria-label={controls.label}>
      <div className="grid gap-5 border-b border-line px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-[minmax(15rem,1fr)_15rem_auto] lg:items-end">
        <label className="grid gap-1">
          <span className="font-mono text-[8px] font-semibold tracking-[0.04em] text-muted">
            {controls.searchLabel}
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
              onChange={(event) => resetPageAnd(() => setQuery(event.target.value))}
              placeholder={controls.searchPlaceholder}
              className="report-filter-control w-full pl-9 pr-2 text-xs placeholder:text-muted"
            />
          </span>
        </label>

        <label className="grid gap-1">
          <span className="font-mono text-[8px] font-semibold tracking-[0.04em] text-muted">
            {controls.sortLabel}
          </span>
          <select
            value={sortMetric}
            onChange={(event) => resetPageAnd(() => setSortMetric(event.target.value))}
            className="report-filter-control w-full px-1 text-xs font-semibold"
          >
            {[
              'applications',
              'response',
              'interview',
              'offer',
              'employment',
              'candidates',
              'company',
            ].map((metric) => (
              <option key={metric} value={metric}>{controls.sort[metric]}</option>
            ))}
          </select>
        </label>

        <SecondaryFilters
          controls={controls}
          minimumSample={minimumSample}
          onMinimumSampleChange={(event) => resetPageAnd(
            () => setMinimumSample(Number(event.target.value)),
          )}
          onPageSizeChange={(event) => resetPageAnd(
            () => setPageSize(Number(event.target.value)),
          )}
          pageSize={pageSize}
        />
      </div>

      <div className="flex min-h-11 items-center justify-between gap-4 border-b border-line px-5">
        <p
          className="font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-muted"
          aria-live="polite"
        >
          {resultsCopy}
        </p>
        {filteredRows.length > 0 && (
          <p className="font-mono text-[8px] font-bold tracking-[0.06em] text-muted">
            {formatNumber(visibleStart, locale)}–{formatNumber(visibleEnd, locale)}
          </p>
        )}
      </div>

      {pageRows.length > 0 ? (
        <>
          <div className="hidden md:block">
            <CompanyTable copy={copy} locale={locale} meta={meta} rows={pageRows} />
          </div>
          <div className="md:hidden">
            <CompanyMobileCards copy={copy} locale={locale} meta={meta} rows={pageRows} />
          </div>
        </>
      ) : (
        <div className="px-6 py-16 text-center">
          <p className="text-lg font-semibold tracking-[-0.02em] text-ink">
            {controls.empty.title}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            {controls.empty.description}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="report-action mt-4"
          >
            {controls.empty.reset}
          </button>
        </div>
      )}

      <nav
        aria-label={controls.pagination.label}
        className="grid min-h-14 grid-cols-[1fr_auto_1fr] items-center border-t border-line px-3 sm:px-5"
      >
        <button
          type="button"
          disabled={currentPage <= 1 || filteredRows.length === 0}
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          className="inline-flex min-h-11 items-center gap-2 justify-self-start px-2 font-mono text-[8px] font-bold uppercase tracking-[0.07em] text-ink transition-colors hover:text-accentDark disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          <span className="hidden sm:inline">{controls.pagination.previous}</span>
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
          <span className="hidden sm:inline">{controls.pagination.next}</span>
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </nav>
    </section>
  )
}

function SummaryStrip({ copy, locale, meta }) {
  const items = [
    { label: copy.summary.records, value: formatNumber(meta.recordCount, locale) },
    { label: copy.summary.candidates, value: formatNumber(meta.uniqueCandidates, locale) },
    { label: copy.summary.period, value: `${formatMonth(meta.periodStart, locale)}–${formatMonth(meta.periodEnd, locale)}` },
  ]

  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-4 border-y border-line px-5 py-5 sm:px-6">
      {items.map((item) => (
        <div key={item.label} className="min-w-[8rem]">
          <dt className="font-mono text-[7px] font-bold uppercase tracking-[0.07em] text-muted sm:text-[8px]">{item.label}</dt>
          <dd className="mt-1.5 font-mono text-sm font-bold tracking-[-0.03em] text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function BenchmarkExplorer({
  compact = false,
  copy,
  embedded = false,
  locale,
  report,
}) {
  const [activeView, setActiveView] = useState('roles')
  const tabRefs = useRef([])
  const views = ['roles', 'companies']
  const roleRows = compact ? report.roleMonthly.slice(0, 4) : report.roleMonthly
  const companyRows = compact ? report.companyFunnel.slice(0, 4) : report.companyFunnel
  const activeIndex = views.indexOf(activeView)
  const contribution = copy.contribution[activeView]

  function selectTab(index) {
    const normalizedIndex = (index + views.length) % views.length
    setActiveView(views[normalizedIndex])
    tabRefs.current[normalizedIndex]?.focus()
  }

  function handleTabKeyDown(event) {
    if (event.key === 'ArrowRight') selectTab(activeIndex + 1)
    else if (event.key === 'ArrowLeft') selectTab(activeIndex - 1)
    else if (event.key === 'Home') selectTab(0)
    else if (event.key === 'End') selectTab(views.length - 1)
    else return

    event.preventDefault()
  }

  return (
    <div className="benchmark-explorer border border-line bg-surface [overflow-anchor:none]">
      {!embedded && (
        <header className={`grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end ${compact ? 'gap-5 p-5 sm:p-6' : 'gap-7 p-6 sm:p-8'}`}>
          <div>
            <p className="inline-flex items-center gap-2 border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-accentDark">
              <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
              {copy.previewLabel}
            </p>
            <h3 className={`max-w-2xl font-semibold leading-[1.05] tracking-[-0.05em] text-ink ${compact ? 'mt-4 text-2xl sm:text-3xl' : 'mt-5 text-3xl sm:text-4xl'}`}>
              {copy.title}
            </h3>
            <p className={`max-w-2xl text-muted ${compact ? 'mt-3 text-xs leading-5' : 'mt-4 text-sm leading-6'}`}>{copy.description}</p>
          </div>

          <div className={`grid gap-2 sm:grid-cols-2 ${compact ? 'lg:w-[24rem]' : 'lg:w-[25rem]'}`}>
            <Link
              href={`/${locale}/surveys/application-benchmark`}
              className="group inline-flex min-h-12 items-center justify-between gap-3 bg-ink px-4 font-mono text-[9px] font-bold uppercase tracking-[0.07em] text-surface transition-colors hover:bg-accentDark"
            >
              {copy.compareCta}
              <ArrowRight size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            {compact ? (
              <Link
                href={`/${locale}/benchmarks`}
                className="group inline-flex min-h-12 items-center justify-between gap-3 border border-ink px-4 font-mono text-[9px] font-bold uppercase tracking-[0.07em] text-ink transition-colors hover:bg-[var(--surface-muted)]"
              >
                {copy.detailCta}
                <ArrowUpRight size={15} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                href={`/${locale}/surveys/company-experience`}
                className="group inline-flex min-h-12 items-center justify-between gap-3 border border-ink px-4 font-mono text-[9px] font-bold uppercase tracking-[0.07em] text-ink transition-colors hover:bg-[var(--surface-muted)]"
              >
                {copy.companySurveyCta}
                <ArrowUpRight size={15} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </header>
      )}

      <SummaryStrip copy={copy} locale={locale} meta={report.meta} />

      <div className="border-b border-line px-5 sm:px-6">
        <div className="flex max-w-md gap-8" role="tablist" aria-label={copy.tabsLabel}>
          {views.map((view, index) => {
            const active = activeView === view

            return (
              <button
                key={view}
                ref={(element) => { tabRefs.current[index] = element }}
                id={`benchmark-tab-${view}`}
                type="button"
                role="tab"
                tabIndex={active ? 0 : -1}
                aria-controls={`benchmark-panel-${view}`}
                aria-selected={active}
                onClick={() => setActiveView(view)}
                onKeyDown={handleTabKeyDown}
                className={`report-subtab ${compact ? 'min-h-11' : 'min-h-12'}`}
              >
                {copy.tabs[view]}
              </button>
            )
          })}
        </div>
      </div>

      <div className={compact ? 'min-h-[268px]' : 'min-h-[360px]'}>
        {views.map((view) => (
          <div
            key={view}
            id={`benchmark-panel-${view}`}
            role="tabpanel"
            aria-labelledby={`benchmark-tab-${view}`}
            hidden={activeView !== view}
          >
            {view === 'roles' && compact ? (
              <>
                <div className="hidden md:block">
                  <RoleTable copy={copy} locale={locale} rows={roleRows} />
                </div>
                <div className="md:hidden">
                  <RoleMobileCards copy={copy} locale={locale} rows={roleRows} />
                </div>
              </>
            ) : view === 'roles' ? (
              <RoleDataExplorer
                copy={copy}
                locale={locale}
                meta={report.meta}
                rows={report.roleMonthly}
              />
            ) : compact ? (
              <>
                <div className="hidden md:block">
                  <CompanyTable copy={copy} locale={locale} meta={report.meta} rows={companyRows} />
                </div>
                <div className="md:hidden">
                  <CompanyMobileCards copy={copy} locale={locale} meta={report.meta} rows={companyRows} />
                </div>
              </>
            ) : (
              <CompanyFunnelExplorer
                copy={copy}
                locale={locale}
                meta={report.meta}
                rows={report.companyFunnel}
              />
            )}
          </div>
        ))}
      </div>

      {!embedded && (
        <footer className={`grid border-t border-[var(--line-strong)] bg-[var(--surface-muted)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${compact ? 'gap-4 p-4 sm:px-5' : 'gap-5 p-5 sm:px-6'}`}>
          <div>
            <p className="font-mono text-[8px] font-bold uppercase tracking-[0.09em] text-accentDark">{contribution.eyebrow}</p>
            <p className={`mt-2 max-w-2xl text-muted ${compact ? 'text-xs leading-5' : 'text-sm leading-6'}`}>{contribution.description}</p>
          </div>
          <Link
            href={`/${locale}${contribution.path}`}
            className="group inline-flex min-h-11 items-center justify-between gap-5 border border-ink bg-surface px-4 font-mono text-[9px] font-bold uppercase tracking-[0.07em] text-ink transition-colors hover:bg-ink hover:text-surface"
          >
            {contribution.cta}
            <ArrowRight size={14} className="shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </footer>
      )}

      <ReportMethodology
        label={copy.methodologyLabel}
        text={`${activeView === 'roles' ? copy.roleDefinition : copy.companyDefinition}. ${copy.methodology}`}
      />
    </div>
  )
}
