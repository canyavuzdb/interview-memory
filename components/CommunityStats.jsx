'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import ResponseStatusBar from '@/components/ResponseStatusBar'

const ROTATION_MS = 10000

function EffortChart({ card }) {
  return (
    <div role="img" aria-label={card.chartAria}>
      <p className="mb-5 font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-muted">
        {card.chartLabel}
      </p>
      <div className="space-y-4">
        {card.stages.map((stage, index) => (
          <div key={stage.label} className="grid grid-cols-[2rem_5.5rem_minmax(0,1fr)_3rem] items-center gap-3">
            <span className="font-mono text-[8px] font-bold text-muted">0{index + 1}</span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted">
              {stage.label}
            </span>
            <div className="relative h-8 border border-[var(--line-strong)] bg-[var(--surface-muted)]">
              <div
                className="h-full min-w-1 bg-ink transition-[width] duration-700"
                style={{ width: stage.share }}
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[9px] font-bold text-surface mix-blend-difference">
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

function HeatmapChart({ card }) {
  const values = card.rows.flatMap((row) => row.values)
  const maxValue = Math.max(...values)

  return (
    <div role="img" aria-label={card.chartAria}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-muted">
          {card.chartLabel}
        </p>
        <p className="text-right font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted">
          {card.columnLabel}
        </p>
      </div>

      <div className="grid grid-cols-[4.25rem_repeat(4,minmax(0,1fr))] gap-1.5">
        <span aria-hidden="true" />
        {card.columns.map((column) => (
          <span key={column} className="text-center font-mono text-[8px] font-bold uppercase text-muted">
            {column}
          </span>
        ))}

        {card.rows.map((row) => (
          <div key={row.label} className="contents">
            <span className="flex items-center font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-muted">
              {row.label}
            </span>
            {row.values.map((value, index) => {
              const intensity = 12 + Math.round((value / maxValue) * 48)
              return (
                <span
                  key={`${row.label}-${card.columns[index]}`}
                  className="grid min-h-16 place-items-center border border-[var(--line-strong)] font-mono text-sm font-bold text-ink sm:min-h-20"
                  style={{ backgroundColor: `color-mix(in srgb, var(--accent) ${intensity}%, var(--surface))` }}
                  title={`${row.label}, ${card.columns[index]}: %${value}`}
                >
                  %{value}
                </span>
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-muted">
        <span>{card.lowLabel}</span>
        <span className="h-1 flex-1 bg-gradient-to-r from-[var(--surface-muted)] to-[var(--accent)]" aria-hidden="true" />
        <span>{card.highLabel}</span>
      </div>
    </div>
  )
}

function Chart({ card }) {
  if (card.type === 'reliability') return <ReliabilityChart card={card} />
  if (card.type === 'heatmap') return <HeatmapChart card={card} />
  return <EffortChart card={card} />
}

export default function CommunityStats({ copy, locale }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const activeCard = copy.cards[activeIndex]

  useEffect(() => {
    if (isPaused) return undefined

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % copy.cards.length)
    }, ROTATION_MS)

    return () => window.clearInterval(interval)
  }, [copy.cards.length, isPaused])

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex items-center justify-between gap-5 pb-2">
        <div className="flex items-baseline gap-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            {copy.eyebrow}
          </p>
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink sm:text-xs">
            {copy.title}
          </h2>
        </div>
        <p className="text-right font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-muted sm:text-[9px]">
          {copy.note}
        </p>
      </div>

      <div
        className="mt-8 border border-[var(--line-strong)] bg-surface shadow-[var(--shadow-soft)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
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
                onClick={() => setActiveIndex(index)}
                className={`relative min-w-0 px-3 py-4 text-left transition-colors sm:px-5 ${index > 0 ? 'border-l border-line' : ''} ${isActive ? 'bg-ink text-surface' : 'bg-transparent text-muted hover:bg-[var(--surface-muted)] hover:text-ink'}`}
              >
                <span className="block font-mono text-[8px] font-bold uppercase tracking-[0.08em] sm:text-[9px]">
                  {card.code} <span className="hidden sm:inline">{card.label}</span>
                </span>
                {isActive && !isPaused && (
                  <span className="community-tab-progress absolute inset-x-0 bottom-0 h-[2px] bg-accent" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>

        <div
          key={activeCard.code}
          className="community-signal-panel grid min-h-[500px] lg:grid-cols-[0.36fr_0.64fr]"
          role="tabpanel"
        >
          <div className="flex flex-col border-b border-line p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-accent">
              {activeCard.eyebrow}
            </p>
            <h3 className="mt-5 text-3xl font-semibold leading-[1.05] tracking-[-0.05em] text-ink sm:text-4xl">
              {activeCard.title}
            </h3>
            {activeCard.summary && (
              <div className="mt-7 border-l-2 border-accent pl-4">
                <p className="font-mono text-[9px] font-bold uppercase leading-5 tracking-[0.08em] text-ink">
                  {activeCard.summary}
                </p>
              </div>
            )}

            <Link
              href={`/${locale}${activeCard.path}`}
              className="group mt-auto flex items-center justify-between gap-4 border-t border-[var(--line-strong)] pt-5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:text-accentDark"
            >
              <span>{activeCard.cta}</span>
              <ArrowUpRight size={16} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex min-w-0 items-center p-6 sm:p-8 lg:p-10">
            <div className="w-full">
              <Chart card={activeCard} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
