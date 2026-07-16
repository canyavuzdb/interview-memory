'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import ResponseStatusBar from '@/components/ResponseStatusBar'

const COVERAGE_LAYOUT = [
  'col-span-4 row-span-3',
  'col-span-2 row-span-3',
  'col-span-2 row-span-2',
  'col-span-2 row-span-2',
  'col-span-2',
  'col-span-2',
]

const COVERAGE_TONES = [
  { background: 'var(--ink)', color: 'var(--surface)' },
  { background: 'color-mix(in srgb, var(--accent) 58%, var(--surface))', color: 'var(--ink)' },
  { background: 'color-mix(in srgb, var(--accent) 44%, var(--surface))', color: 'var(--ink)' },
  { background: 'color-mix(in srgb, var(--accent) 32%, var(--surface))', color: 'var(--ink)' },
  { background: 'color-mix(in srgb, var(--accent) 22%, var(--surface))', color: 'var(--ink)' },
  { background: 'var(--surface-muted)', color: 'var(--ink)' },
]

function EffortChart({ card }) {
  return (
    <div role="img" aria-label={card.chartAria}>
      <p className="mb-5 font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-muted">
        {card.chartLabel}
      </p>
      <div className="space-y-4">
        {card.stages.map((stage, index) => (
          <div key={stage.label} className="grid grid-cols-[1.5rem_4.25rem_minmax(2.5rem,1fr)_2rem] items-center gap-2 sm:grid-cols-[2rem_5.5rem_minmax(0,1fr)_3rem] sm:gap-3">
            <span className="font-mono text-[8px] font-bold text-muted">0{index + 1}</span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted">
              {stage.label}
            </span>
            <div className="relative h-8 border border-[var(--line-strong)] bg-[var(--surface-muted)]">
              <div
                className="h-full min-w-1 bg-ink transition-[width] duration-700"
                style={{ width: stage.share }}
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[9px] font-bold text-surface">
                {stage.share}
              </span>
            </div>
            <span className="text-right font-mono text-base font-bold tracking-[-0.05em] text-ink">
              {stage.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReliabilityChart({ card }) {
  return (
    <div role="img" aria-label={card.chartAria}>
      <p className="mb-5 font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-muted">
        {card.chartLabel}
      </p>
      <ResponseStatusBar distribution={card.distribution} showScale />
      <div className="mt-8 grid grid-cols-2 border-y border-[var(--line-strong)]">
        {card.metrics.map((metric, index) => (
          <div key={metric.label} className={`py-5 ${index === 0 ? 'border-r border-line pr-5' : 'pl-5'}`}>
            <p className="font-mono text-3xl font-bold tracking-[-0.07em] text-ink">{metric.value}</p>
            <p className="mt-2 max-w-[12rem] font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CoverageChart({ card }) {
  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-muted">
          {card.chartLabel}
        </p>
        <p className="text-right font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-accentDark">
          {card.dataLabel}
        </p>
      </div>

      <ul
        aria-label={card.chartAria}
        className="hidden h-[280px] grid-flow-row grid-rows-3 gap-1 lg:grid"
        style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}
      >
        {card.items.map((item, index) => (
          <li
            key={item.label}
            className={`${COVERAGE_LAYOUT[index]} flex min-w-0 flex-col justify-end overflow-hidden border border-[var(--line-strong)] p-3`}
            style={COVERAGE_TONES[index]}
          >
            <span className="truncate font-mono text-[8px] font-bold uppercase tracking-[0.05em] sm:text-[9px]">
              {item.label}
            </span>
            <span className="mt-1 font-mono text-lg font-bold tracking-[-0.05em]">
              %{item.value}
            </span>
          </li>
        ))}
      </ul>

      <ul aria-label={card.chartAria} className="space-y-2 lg:hidden">
        {card.items.map((item, index) => (
          <li key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted">
              <span>{item.label}</span>
              <span className="text-ink">%{item.value}</span>
            </div>
            <div className="h-5 border border-[var(--line-strong)] bg-[var(--surface-muted)]">
              <span
                aria-hidden="true"
                className="block h-full min-w-1"
                style={{ ...COVERAGE_TONES[index], width: `${item.value}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-line pt-4 font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.06em] text-muted">
        {card.note}
      </p>
    </div>
  )
}

function Chart({ card }) {
  if (card.type === 'reliability') return <ReliabilityChart card={card} />
  if (card.type === 'coverage') return <CoverageChart card={card} />
  return <EffortChart card={card} />
}

function CommunityCard({ card, locale, measuring = false }) {
  return (
    <div
      aria-hidden={measuring || undefined}
      inert={measuring || undefined}
      role={measuring ? undefined : 'tabpanel'}
      className={`community-signal-layout col-start-1 row-start-1 grid min-h-[46rem] lg:min-h-[500px] lg:grid-cols-[0.36fr_0.64fr] ${measuring ? 'invisible pointer-events-none' : 'community-signal-panel'}`}
    >
      <div className="flex flex-col border-b border-line p-6 sm:p-8 lg:border-b-0 lg:border-r">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-accent">
          {card.eyebrow}
        </p>
        <h3 className="mt-5 text-3xl font-semibold leading-[1.05] tracking-[-0.05em] text-ink sm:text-4xl">
          {card.title}
        </h3>
        {card.summary && (
          <div className="mt-7 border-l-2 border-accent pl-4">
            <p className="font-mono text-[9px] font-bold uppercase leading-5 tracking-[0.08em] text-ink">
              {card.summary}
            </p>
          </div>
        )}

        <Link
          href={`/${locale}${card.path}`}
          className="group mt-auto flex items-center justify-between gap-4 border-t border-[var(--line-strong)] pt-5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:text-accentDark"
        >
          <span>{card.cta}</span>
          <ArrowUpRight size={16} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="flex min-w-0 items-center p-6 sm:p-8 lg:p-10">
        <div className="w-full">
          <Chart card={card} />
        </div>
      </div>
    </div>
  )
}

export default function CommunityStats({ copy, locale }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFocusPaused, setIsFocusPaused] = useState(false)
  const [isPointerPaused, setIsPointerPaused] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [isDocumentVisible, setIsDocumentVisible] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [cycleKey, setCycleKey] = useState(0)
  const sectionRef = useRef(null)
  const activeCard = copy.cards[activeIndex]

  useEffect(() => {
    const section = sectionRef.current

    if (!section || typeof IntersectionObserver !== 'function') {
      setIsInView(true)
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.2)
    }, { threshold: [0, 0.2] })

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    function syncMotionPreference() {
      setPrefersReducedMotion(motionQuery.matches)
    }

    function syncDocumentVisibility() {
      setIsDocumentVisible(!document.hidden)
    }

    syncMotionPreference()
    syncDocumentVisibility()
    motionQuery.addEventListener('change', syncMotionPreference)
    document.addEventListener('visibilitychange', syncDocumentVisibility)

    return () => {
      motionQuery.removeEventListener('change', syncMotionPreference)
      document.removeEventListener('visibilitychange', syncDocumentVisibility)
    }
  }, [])

  function selectCard(index) {
    setActiveIndex(index)
    setCycleKey((current) => current + 1)
  }

  function advanceCard() {
    setActiveIndex((current) => (current + 1) % copy.cards.length)
    setCycleKey((current) => current + 1)
  }

  const shouldRotate = isInView
    && isDocumentVisible
    && !isFocusPaused
    && !isPointerPaused
    && !prefersReducedMotion

  return (
    <section ref={sectionRef} className="community-stats-section mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-3 pb-2 sm:flex sm:items-center sm:justify-between sm:gap-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <p className="community-stats-zone-eyebrow font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            {copy.eyebrow}
          </p>
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink sm:text-xs">
            {copy.title}
          </h2>
        </div>
        <p className="community-stats-zone-note font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-muted sm:text-right sm:text-[9px]">
          {copy.note}
        </p>
      </div>

      <div
        className="community-stats-frame mt-8 border border-[var(--line-strong)] bg-surface shadow-[var(--shadow-soft)] [overflow-anchor:none]"
        onMouseEnter={() => setIsPointerPaused(true)}
        onMouseLeave={() => setIsPointerPaused(false)}
        onFocusCapture={() => setIsFocusPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsFocusPaused(false)
        }}
      >
        <div className="grid grid-cols-3 border-b border-[var(--line-strong)]" role="tablist" aria-label={copy.tabsLabel}>
          {copy.cards.map((card, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={card.code}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectCard(index)}
                className={`relative min-w-0 px-3 py-4 text-left transition-colors sm:px-5 ${index > 0 ? 'border-l border-line' : ''} ${isActive ? 'bg-ink text-surface' : 'bg-transparent text-muted hover:bg-[var(--surface-muted)] hover:text-ink'}`}
              >
                <span className="block font-mono text-[8px] font-bold uppercase tracking-[0.08em] sm:text-[9px]">
                  {card.code} <span className="hidden sm:inline">{card.label}</span>
                </span>
                {isActive && shouldRotate && (
                  <span
                    key={`${card.code}-${cycleKey}`}
                    className="community-tab-progress absolute inset-x-0 bottom-0 h-[2px] bg-accent"
                    aria-hidden="true"
                    onAnimationEnd={advanceCard}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="community-signal-stage grid">
          {copy.cards.map((card) => (
            <CommunityCard
              key={`measure-${card.code}`}
              measuring
              card={card}
              locale={locale}
            />
          ))}
          <CommunityCard
            key={`${activeCard.code}-${cycleKey}`}
            card={activeCard}
            locale={locale}
          />
        </div>

      </div>
    </section>
  )
}
