'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

function Kpi({ value, label }) {
  return (
    <div className="px-5 py-4 sm:px-6">
      <p className="font-mono text-4xl font-bold leading-none tracking-[-0.09em] text-ink sm:text-5xl">
        {value}
      </p>
      <p className="mt-2 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.1em] text-muted">
        {label}
      </p>
    </div>
  )
}

function FunnelChart({ label, stages }) {
  return (
    <div className="mt-6">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <div className="mt-3 grid grid-cols-2 border border-[var(--line-strong)] sm:grid-cols-4 sm:divide-x sm:divide-[var(--line-strong)]">
        {stages.map((stage, index) => (
          <div
            key={stage.label}
            className={`min-h-24 p-3 ${index < 2 ? 'border-b border-[var(--line-strong)] sm:border-b-0' : ''} ${index % 2 === 0 ? 'border-r border-[var(--line-strong)] sm:border-r-0' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-mono text-2xl font-bold tracking-[-0.08em] text-ink">
                {stage.value}
              </p>
              <span className="font-mono text-[9px] font-bold text-accent">
                {stage.share}
              </span>
            </div>
            <p className="mt-3 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
              {stage.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DistributionChart({ label, distribution }) {
  return (
    <div className="mt-6">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <div className="mt-3 flex h-7 overflow-hidden border border-[var(--line-strong)]">
        {distribution.map((item, index) => (
          <div
            key={item.label}
            style={{ width: item.width }}
            className={index === 0 ? 'bg-ink' : 'bg-accent'}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4">
        {distribution.map((item, index) => (
          <div key={item.label} className="flex items-start gap-2">
            <span className={`mt-1 h-2 w-2 shrink-0 ${index === 0 ? 'bg-ink' : 'bg-accent'}`} />
            <div>
              <p className="font-mono text-xs font-bold text-ink">{item.value}</p>
              <p className="mt-1 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsView({ copy, locale, onAnimationEnd, outgoing = false, view }) {
  return (
    <div
      aria-hidden={outgoing || undefined}
      inert={outgoing || undefined}
      onAnimationEnd={onAnimationEnd}
      className={`flex flex-col px-5 py-5 sm:px-7 sm:py-6 ${outgoing ? 'analytics-view-out pointer-events-none absolute inset-0 z-10' : 'analytics-view-in relative z-0 w-full'}`}
    >
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-accent">
        {view.eyebrow}
      </p>
      <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-[-0.04em] text-ink sm:text-3xl">
        {view.title}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        {view.description}
      </p>

      <div className="mt-5 grid grid-cols-2 divide-x divide-[var(--line-strong)] border-y border-[var(--line-strong)]">
        <Kpi value={view.primaryValue} label={view.primaryLabel} />
        <Kpi value={view.secondaryValue} label={view.secondaryLabel} />
      </div>

      {view.type === 'funnel' ? (
        <FunnelChart label={view.chartLabel ?? copy.flowChartLabel} stages={view.stages} />
      ) : (
        <DistributionChart
          label={view.chartLabel ?? copy.distributionChartLabel}
          distribution={view.distribution}
        />
      )}

      <footer className="mt-auto flex items-end justify-between gap-5 border-t border-[var(--line-strong)] pt-4">
        <p className="max-w-xs text-[10px] leading-4 text-muted">
          {copy.methodology}
        </p>
        <Link
          href={`/${locale}${view.path}`}
          className="inline-flex shrink-0 items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-ink transition hover:text-accent"
        >
          <span className="hidden sm:inline">{copy.viewCta}</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
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
      className="hero-analytics-panel relative flex min-h-[640px] scroll-mt-24 flex-col overflow-hidden border border-[var(--line-strong)] bg-surface shadow-[var(--shadow-card)] [overflow-anchor:none] xl:h-[680px]"
    >
      <header className="flex items-center justify-between gap-4 px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink">
          01 / {copy.eyebrow}
        </p>
        <div className="text-right font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.1em] text-muted">
          <p>{copy.sampleData}</p>
          <p className="text-accent">n = {copy.sampleSize}</p>
        </div>
      </header>

      <div
        role="tablist"
        aria-label={copy.panelLabel}
        className="grid grid-cols-2 border-y border-[var(--line-strong)] sm:grid-cols-4"
      >
        {copy.views.map((item, index) => {
          const active = index === activeIndex
          const tabBorders = [
            'border-b border-r border-[var(--line-strong)] sm:border-b-0',
            'border-b border-[var(--line-strong)] sm:border-b-0 sm:border-r',
            'border-r border-[var(--line-strong)]',
            '',
          ][index]

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="hero-analytics-panel"
              onClick={() => selectView(index)}
              className={`relative min-h-14 overflow-hidden px-3 py-2 text-left font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.06em] transition ${tabBorders} ${active ? 'bg-ink text-surface' : 'text-muted hover:bg-[var(--surface-hover)] hover:text-ink'}`}
            >
              {active && (
                <span
                  key={`${item.id}-${cycleKey}`}
                  aria-hidden="true"
                  onAnimationEnd={advanceView}
                  className="analytics-tab-progress absolute inset-0 bg-accent"
                />
              )}
              <span className="relative z-10">
                {String(index + 1).padStart(2, '0')} / {item.tabLabel}
              </span>
            </button>
          )
        })}
      </div>

      <div
        id="hero-analytics-panel"
        role="tabpanel"
        className="relative flex flex-1"
      >
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
