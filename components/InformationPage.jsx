'use client'

import { ChevronDown, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import PublicHeader from './PublicHeader'
import SiteFooter from './SiteFooter'

function Faqs({ items }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="border-y border-dashed border-[var(--line-emphasis)]">
      {items.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <div key={item.question} className={index ? 'border-t border-dashed border-[var(--line-emphasis)]' : ''}>
            <button
              type="button"
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-5 text-left font-semibold"
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              {item.question}
              <ChevronDown
                size={18}
                className={`shrink-0 text-accentDark transition-transform duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className={`max-w-3xl pb-6 text-sm leading-7 text-muted transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${isOpen ? 'translate-y-0' : '-translate-y-2'}`}>
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function InformationPage({ alternateMessages, locale, messages, page, slug }) {
  return (
    <main className="information-page landing-grid min-h-screen text-ink">
      <PublicHeader alternateCopy={alternateMessages.header} common={messages.common} copy={messages.header} locale={locale} path={`/${slug}`} />
      <section className="mx-auto max-w-5xl px-5 pb-20 pt-16 sm:px-6 md:pt-20 lg:px-8 lg:pb-28">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent">{page.eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] sm:text-7xl">{page.title}</h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-muted sm:text-xl">{page.intro}</p>
        {page.updated && <p className="mt-6 font-mono text-[9px] font-bold uppercase tracking-[0.09em] text-muted">{page.updated}</p>}

        {page.faqs ? <section className="mt-16"><Faqs items={page.faqs} /></section> : (
          <div className="mt-16 border-y border-dashed border-[var(--line-emphasis)]">
            {page.sections.map((section, index) => (
              <section key={section.title} className={`grid gap-4 py-7 sm:grid-cols-[12rem_1fr] sm:gap-10 ${index ? 'border-t border-dashed border-[var(--line-emphasis)]' : ''}`}>
                <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-accentDark">{section.title}</h2>
                <div className="max-w-2xl space-y-4 text-sm leading-7 text-muted">
                  {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            ))}
          </div>
        )}

        {page.links && <div className="mt-12 flex flex-wrap gap-3">
          {page.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[var(--line-strong)] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition-colors hover:border-accent hover:text-accentDark">{link.label}<ArrowUpRight size={14} /></a>)}
        </div>}
      </section>
      <div className="landing-footer-zone"><SiteFooter copy={{ ...messages.footer, homeAria: messages.common.homeAria }} locale={locale} /></div>
    </main>
  )
}
