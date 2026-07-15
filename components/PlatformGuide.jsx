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
        <details
          key={faq.question}
          open={openIndex === index}
          className={`group ${index > 0 ? 'border-t border-line' : ''}`}
        >
          <summary
            onClick={(event) => {
              event.preventDefault()
              setOpenIndex((current) => (current === index ? null : index))
            }}
            className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-left text-sm font-semibold leading-6 text-ink transition-colors hover:text-accentDark [&::-webkit-details-marker]:hidden"
          >
            <span>{faq.question}</span>
            <ChevronDown
              size={17}
              className="shrink-0 text-muted transition-transform duration-300 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="max-w-3xl pb-6 pr-8 text-sm leading-6 text-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  )
}

function PanelBody({ panel }) {
  if (panel.faqs) return <FaqList faqs={panel.faqs} />
  if (panel.items) return <OfferingGrid items={panel.items} />
  return <ProcessRows rows={panel.steps ?? []} />
}

export default function PlatformGuide({ copy }) {
  const panels = copy.panels ?? []
  const [activeId, setActiveId] = useState(panels[0]?.id)
  const activePanel = panels.find((panel) => panel.id === activeId) ?? panels[0]

  if (!activePanel) return null

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="platform-guide-title">
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

      <div className="mt-8 border border-[var(--line-strong)] bg-surface shadow-[var(--shadow-soft)] lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <div
          role="group"
          aria-label={copy.controlsLabel}
          className="grid grid-cols-3 border-b border-[var(--line-strong)] lg:block lg:border-b-0 lg:border-r"
        >
          {panels.map((panel, index) => {
            const isActive = panel.id === activePanel.id

            return (
              <button
                key={panel.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveId(panel.id)}
                className={`min-w-0 px-2 py-4 text-left transition-colors sm:px-4 lg:block lg:w-full lg:px-6 lg:py-6 ${index > 0 ? 'border-l border-line lg:border-l-0 lg:border-t' : ''} ${isActive ? 'bg-ink text-surface' : 'bg-transparent text-muted hover:bg-[var(--surface-muted)] hover:text-ink'}`}
              >
                <span className={`block font-mono text-[8px] font-bold uppercase tracking-[0.09em] ${isActive ? 'text-accent' : 'text-accentDark'}`}>
                  {panel.code}
                </span>
                <span className="mt-2 block truncate font-mono text-[8px] font-bold uppercase tracking-[0.07em] sm:text-[9px] lg:whitespace-normal lg:text-[10px]">
                  {panel.label}
                </span>
              </button>
            )
          })}
        </div>

        <div
          key={activePanel.id}
          id={`platform-guide-panel-${activePanel.id}`}
          role="region"
          aria-labelledby={`platform-guide-panel-heading-${activePanel.id}`}
          aria-live="polite"
          className="flex min-w-0 flex-col p-6 sm:p-8 lg:min-h-[37rem] lg:p-10"
        >
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-accent">
              {activePanel.eyebrow}
            </p>
            <h3
              id={`platform-guide-panel-heading-${activePanel.id}`}
              className="mt-5 max-w-3xl text-2xl font-semibold leading-[1.08] tracking-[-0.04em] text-ink sm:text-3xl lg:text-4xl"
            >
              {activePanel.title}
            </h3>
            <p className="mt-5 max-w-3xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
              {activePanel.description}
            </p>
          </div>

          <PanelBody panel={activePanel} />

          <p className="mt-auto border-t border-line pt-5 font-mono text-[8px] font-bold uppercase leading-4 tracking-[0.07em] text-muted">
            {copy.prototypeNote}
          </p>
        </div>
      </div>
    </section>
  )
}
