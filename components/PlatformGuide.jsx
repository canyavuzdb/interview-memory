'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

function ProcessRows({ rows }) {
  return (
    <ol className="mt-8 border-y border-[var(--line-strong)]">
      {rows.map((row, index) => (
        <li
          key={`${row.code}-${row.title}`}
          className={`grid gap-3 py-5 sm:grid-cols-[3.5rem_0.7fr_1.3fr] sm:items-start sm:gap-5 ${index > 0 ? 'border-t border-line' : ''}`}
        >
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-accent">
            {row.code}
          </span>
          <h4 className="text-sm font-semibold leading-5 text-ink sm:text-base">{row.title}</h4>
          <p className="text-sm leading-6 text-muted">{row.description}</p>
        </li>
      ))}
    </ol>
  )
}

function OfferingGrid({ items }) {
  return (
    <ul className="mt-8 border-y border-[var(--line-strong)] md:grid md:grid-cols-3 md:divide-x md:divide-line">
      {items.map((item, index) => (
        <li
          key={`${item.code}-${item.title}`}
          className={`min-w-0 py-5 md:px-5 md:py-6 ${index > 0 ? 'border-t border-line md:border-t-0' : ''} first:md:pl-0 last:md:pr-0`}
        >
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-accent">
            {item.code}
          </span>
          <h4 className="mt-4 text-base font-semibold leading-6 text-ink">{item.title}</h4>
          <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
        </li>
      ))}
    </ul>
  )
}

function FaqList({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="mt-8 border-y border-[var(--line-strong)]">
      {faqs.map((faq, index) => (
        <div key={faq.question} className={index > 0 ? 'border-t border-line' : ''}>
          <button
            type="button"
            aria-expanded={openIndex === index}
            onClick={() => setOpenIndex((current) => (current === index ? null : index))}
            className="flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-semibold leading-6 text-ink transition-colors hover:text-accentDark"
          >
            <span>{faq.question}</span>
            <ChevronDown
              size={17}
              className={`shrink-0 text-muted transition-transform duration-300 ease-out motion-reduce:transition-none ${openIndex === index ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="min-h-0 overflow-hidden">
              <p className={`max-w-3xl pb-6 pr-8 text-sm leading-6 text-muted transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${openIndex === index ? 'translate-y-0' : '-translate-y-2'}`}>{faq.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function PanelBody({ panel }) {
  if (panel.faqs) return <FaqList faqs={panel.faqs} />
  if (panel.items) return <OfferingGrid items={panel.items} />
  return <ProcessRows rows={panel.steps ?? []} />
}

function GuidePanelContent({ copy, panel }) {
  return (
    <div
      aria-labelledby={`platform-guide-panel-heading-${panel.id}`}
      id={`platform-guide-panel-${panel.id}`}
      role="region"
      className="platform-guide-panel flex min-w-0 flex-col p-6 sm:p-8 lg:min-h-[37rem] lg:p-10"
    >
      <div>
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-accent">
          {panel.eyebrow}
        </p>
        <h3
          id={`platform-guide-panel-heading-${panel.id}`}
          className="mt-5 max-w-3xl text-2xl font-semibold leading-[1.08] tracking-[-0.04em] text-ink sm:text-3xl lg:text-4xl"
        >
          {panel.title}
        </h3>
        <p className="mt-5 max-w-3xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
          {panel.description}
        </p>
      </div>

      <PanelBody panel={panel} />

      <p className="mt-auto border-t border-line pt-5 font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.07em] text-muted">
        {copy.prototypeNote}
      </p>
    </div>
  )
}

export default function PlatformGuide({ copy }) {
  const panels = copy.panels ?? []
  const [activeId, setActiveId] = useState(panels[0]?.id)
  const [previousId, setPreviousId] = useState(null)
  const [direction, setDirection] = useState('forward')
  const activePanel = panels.find((panel) => panel.id === activeId) ?? panels[0]

  if (!activePanel) return null

  function selectPanel(nextId) {
    if (nextId === activePanel.id) return

    const activeIndex = panels.findIndex((panel) => panel.id === activePanel.id)
    const nextIndex = panels.findIndex((panel) => panel.id === nextId)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    setDirection(nextIndex >= activeIndex ? 'forward' : 'backward')
    setPreviousId(reduceMotion ? null : activePanel.id)
    setActiveId(nextId)
  }

  function completeTransition(panelId, event) {
    if (event.target !== event.currentTarget || previousId !== panelId) return
    setPreviousId(null)
  }

  return (
    <section className="platform-guide-section mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="platform-guide-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pb-2">
        <div className="flex items-baseline gap-3">
          <p className="platform-guide-zone-eyebrow font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            {copy.eyebrow}
          </p>
          <h2
            id="platform-guide-title"
            className="platform-guide-zone-title font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink sm:text-xs"
          >
            {copy.title}
          </h2>
        </div>
        <p className="platform-guide-zone-note font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-muted sm:text-right sm:text-[9px]">
          {copy.note}
        </p>
      </div>

      <div className="platform-guide-frame mt-8 border border-[var(--line-strong)] bg-surface shadow-[var(--shadow-soft)] [overflow-anchor:none] lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div
          role="tablist"
          aria-label={copy.controlsLabel}
          aria-orientation="vertical"
          className="grid grid-cols-3 border-b border-[var(--line-strong)] lg:block lg:border-b-0 lg:border-r lg:px-5 lg:py-6"
        >
          {panels.map((panel, index) => {
            const isActive = panel.id === activePanel.id

            return (
              <button
                key={panel.id}
                id={`platform-guide-tab-${panel.id}`}
                type="button"
                role="tab"
                tabIndex={isActive ? 0 : -1}
                aria-controls={`platform-guide-panel-${panel.id}`}
                aria-selected={isActive}
                onClick={() => selectPanel(panel.id)}
                className={`group relative min-w-0 px-2 py-4 text-left transition-colors duration-300 sm:px-4 lg:grid lg:h-16 lg:w-full lg:grid-cols-[1.5rem_minmax(0,1fr)] lg:items-center lg:gap-2 lg:px-3 ${index > 0 ? 'border-l border-line lg:border-0' : ''} ${isActive ? 'bg-[var(--surface-muted)] text-ink lg:bg-transparent' : 'bg-transparent text-muted hover:text-ink'}`}
              >
                <span className={`block font-mono text-[8px] font-bold uppercase tracking-[0.09em] ${isActive ? 'text-accentDark' : 'text-accent lg:text-accentDark'}`}>
                  {panel.code}
                </span>
                <span className={`mt-2 block break-words font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.07em] sm:text-[9px] lg:mt-0 lg:text-[12px] lg:normal-case lg:tracking-[-0.01em] ${isActive ? 'lg:font-bold' : 'lg:font-semibold'}`}>
                  {panel.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="benchmark-report-stack min-w-0" aria-live="polite">
          {panels.map((panel) => {
            const active = panel.id === activePanel.id
            const outgoing = panel.id === previousId

            return (
              <div
                key={panel.id}
                role="tabpanel"
                aria-labelledby={`platform-guide-tab-${panel.id}`}
                aria-hidden={!active || undefined}
                inert={!active || undefined}
                onAnimationEnd={outgoing ? (event) => completeTransition(panel.id, event) : undefined}
                className={`benchmark-report-view ${
                  active
                    ? 'benchmark-report-view-in'
                    : outgoing
                      ? 'benchmark-report-view-out'
                      : 'benchmark-report-view-parked'
                }`}
                style={{
                  '--benchmark-report-enter-x': direction === 'forward' ? '18px' : '-18px',
                  '--benchmark-report-exit-x': direction === 'forward' ? '-18px' : '18px',
                }}
              >
                <GuidePanelContent copy={copy} panel={panel} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
