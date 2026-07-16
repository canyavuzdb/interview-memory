'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const toneVariables = {
  accent: '--accent',
  late: '--status-late',
  muted: '--line-emphasis',
  rejected: '--status-rejected',
  silent: '--status-silent',
  timely: '--status-timely',
}

function toneColor(tone) {
  return `var(${toneVariables[tone] ?? toneVariables.accent})`
}

function RankedBars({ items, label }) {
  return (
    <div role="img" aria-label={label} className="space-y-3.5">
      {items.map((item, index) => (
        <div key={item.label} className="grid grid-cols-[1.25rem_5.8rem_minmax(0,1fr)_2.5rem] items-center gap-2">
          <span className="font-mono text-[8px] font-bold text-muted opacity-70" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.07em] text-muted">
            {item.label}
          </span>
          <span className="h-2 bg-[var(--line)]">
            <span
              className="block h-full"
              style={{
                width: item.width,
                backgroundColor: toneColor(item.tone),
                opacity: item.opacity ?? 1,
              }}
            />
          </span>
          <span className="text-right font-mono text-[10px] font-bold text-ink">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function BinaryBar({ label, segments }) {
  return (
    <div role="img" aria-label={label}>
      <div className="flex h-6 overflow-hidden border border-[var(--line-strong)]">
        {segments.map((segment) => (
          <span
            key={segment.label}
            style={{ width: segment.width, backgroundColor: toneColor(segment.tone) }}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-5">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0"
              style={{ backgroundColor: toneColor(segment.tone) }}
              aria-hidden="true"
            />
            <span className="font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.07em] text-muted">
              <strong className="mr-1 text-ink">{segment.value}</strong>
              {segment.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonBars({ items, label }) {
  return (
    <div role="img" aria-label={label} className="space-y-4">
      {items.map((item, index) => (
        <div key={item.label}>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <span className="inline-flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
              <span className="text-[8px] opacity-70" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              {item.label}
            </span>
            <span className="font-mono text-sm font-bold tracking-[-0.03em] text-ink">
              {item.value}
            </span>
          </div>
          <div className="h-2 bg-[var(--line)]">
            <span
              className="block h-full"
              style={{ width: item.width, backgroundColor: toneColor(item.tone) }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function InsightVisual({ view }) {
  if (view.visualType === 'binary') {
    return <BinaryBar label={view.visualLabel} segments={view.visualItems} />
  }

  if (view.visualType === 'comparison') {
    return <ComparisonBars label={view.visualLabel} items={view.visualItems} />
  }

  return <RankedBars label={view.visualLabel} items={view.visualItems} />
}

function Metric({ label, primary = false, value }) {
  return (
    <div className="flex min-w-0 flex-col justify-center px-4 py-3 sm:px-5">
      <p className={`font-mono font-bold leading-none tracking-[-0.08em] text-ink ${primary ? 'text-[2.65rem]' : 'text-[2rem]'}`}>
        {value}
      </p>
      <p className="mt-2 max-w-[11rem] font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.07em] text-muted">
        {label}
      </p>
    </div>
  )
}

function AnalyticsView({ copy, locale, measuring = false, onAnimationEnd, outgoing = false, view }) {
  const stateClass = measuring
    ? 'invisible pointer-events-none relative col-start-1 row-start-1'
    : outgoing
      ? 'analytics-view-out pointer-events-none absolute inset-0 z-20 h-full'
      : 'analytics-view-in absolute inset-0 z-10 h-full'

  return (
    <div
      aria-hidden={measuring || outgoing || undefined}
      inert={measuring || outgoing || undefined}
      onAnimationEnd={measuring ? undefined : onAnimationEnd}
      className={`hero-panel-view flex min-h-0 w-full flex-col ${stateClass}`}
    >
      <div className="flex min-h-0 flex-1 flex-col py-3">
        <h2 className="hero-panel-title flex min-h-14 max-w-md items-end text-[1.4rem] font-semibold leading-[1.15] tracking-[-0.04em] text-ink">
          {view.title}
        </h2>

        <div className="mt-4 grid min-h-[104px] grid-cols-[1.08fr_0.92fr] divide-x divide-[var(--line-strong)] border-y border-[var(--line-strong)]">
          <Metric primary value={view.primaryValue} label={view.primaryLabel} />
          <Metric value={view.secondaryValue} label={view.secondaryLabel} />
        </div>

        <div className="hero-data-surface mt-5 flex min-h-40 flex-1 flex-col border border-[var(--line-strong)] p-4">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
              {view.visualTitle}
            </p>
            {view.visualUnit && (
              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted">
                {view.visualUnit}
              </span>
            )}
          </div>
          <div className="my-auto">
            <InsightVisual view={view} />
          </div>
        </div>
      </div>

      <footer className="flex min-h-12 items-center justify-between gap-4 border-t border-[var(--line-strong)] pt-3">
        <p className="max-w-[15rem] text-[10px] leading-4 text-muted">
          {copy.methodology}
        </p>
        {view.path ? (
          <Link
            href={`/${locale}${view.path}`}
            className="inline-flex shrink-0 items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-ink transition hover:text-accent"
          >
            <span>{view.cta}</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        ) : (
          <span className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            {copy.comingSoon}
          </span>
        )}
      </footer>
    </div>
  )
}

export default function HeroAnalyticsPanel({ copy, locale }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [cycleKey, setCycleKey] = useState(0)
  const [previousIndex, setPreviousIndex] = useState(null)
  const view = copy.views[activeIndex]

  function changeView(index) {
    if (index === activeIndex) {
      setCycleKey((current) => current + 1)
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPreviousIndex(null)
      setActiveIndex(index)
      setCycleKey((current) => current + 1)
      return
    }

    setPreviousIndex(activeIndex)
    setActiveIndex(index)
    setCycleKey((current) => current + 1)
  }

  function advanceView() {
    changeView((activeIndex + 1) % copy.views.length)
  }

  function selectView(index) {
    changeView(index)
  }

  return (
    <section
      id="hero-signals"
      aria-label={copy.panelLabel}
      className="hero-analytics-panel relative flex min-h-[620px] w-full min-w-0 scroll-mt-24 flex-col overflow-hidden border border-[var(--line-strong)] bg-surface shadow-[var(--shadow-card)] [overflow-anchor:none] sm:min-h-[590px] xl:min-h-[650px]"
    >
      <header className="flex min-h-[52px] items-center justify-between gap-4 border-b border-[var(--line-strong)] px-5 sm:px-6">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
          {copy.panelType}
        </p>
        <p className="font-mono text-[9px] font-bold tracking-[0.1em] text-accentDark" aria-live="polite">
          {String(activeIndex + 1).padStart(2, '0')} / {String(copy.views.length).padStart(2, '0')}
        </p>
      </header>

      <div
        role="tablist"
        aria-label={copy.panelLabel}
        className="hero-panel-tabs grid gap-1 border-b border-[var(--line-strong)] px-3 py-2 sm:px-4"
      >
        {copy.views.map((item, index) => {
          const active = index === activeIndex

          return (
            <button
              key={item.id}
              id={`hero-tab-${item.id}`}
              type="button"
              role="tab"
              aria-label={item.tabAriaLabel}
              aria-selected={active}
              aria-controls="hero-analytics-panel"
              onClick={() => selectView(index)}
              className={`relative min-h-11 overflow-hidden px-2 py-2 text-center font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.06em] transition ${active ? 'bg-[var(--accent-soft)] text-accentDark' : 'text-muted hover:bg-[var(--accent-soft)] hover:text-accentDark'}`}
            >
              {active && (
                <span
                  key={`${item.id}-${cycleKey}`}
                  aria-hidden="true"
                  onAnimationEnd={advanceView}
                  className="analytics-tab-progress absolute bottom-0 left-0 h-0.5 w-full bg-accent"
                />
              )}
              <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
                <span className="text-[8px] opacity-65" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item.tabLabel}
              </span>
            </button>
          )
        })}
      </div>

      <div
        id="hero-analytics-panel"
        role="tabpanel"
        aria-labelledby={`hero-tab-${view.id}`}
        className="relative grid min-h-0 w-full flex-1 overflow-hidden"
      >
        {copy.views.map((candidate) => (
          <AnalyticsView
            key={`measure-${candidate.id}`}
            measuring
            copy={copy}
            locale={locale}
            view={candidate}
          />
        ))}
        {previousIndex !== null && (
          <AnalyticsView
            outgoing
            copy={copy}
            locale={locale}
            view={copy.views[previousIndex]}
            onAnimationEnd={() => setPreviousIndex(null)}
          />
        )}
        <AnalyticsView
          key={`${view.id}-${cycleKey}`}
          copy={copy}
          locale={locale}
          view={view}
        />
      </div>
    </section>
  )
}
