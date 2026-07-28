'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BarChart3, LockKeyhole, MessageSquareText, Search } from 'lucide-react'

import { preparationSeniorities } from '@/lib/interview-preparation/contracts'

function Select({ children, ...props }) {
  return (
    <select {...props} className="w-full border border-line bg-canvas px-3 py-3 text-sm text-ink outline-none transition focus:border-accent">
      {children}
    </select>
  )
}

function RankedList({ title, items, labels, sampleSize }) {
  return (
    <section className="border border-line bg-surface p-5">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <ol className="mt-4 space-y-3">
        {items.slice(0, 4).map((item, index) => (
          <li key={item.code} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-3"><span className="font-mono text-xs text-accent">0{index + 1}</span>{labels[item.code] ?? item.code}</span>
            <span className="font-mono text-xs font-bold text-muted">{Math.round((item.count / sampleSize) * 100)}%</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function SummaryList({ icon: Icon, title, items }) {
  if (!items.length) return null
  return (
    <section className="border border-line bg-surface p-5 md:col-span-2">
      <div className="flex items-center gap-2"><Icon size={17} className="text-accent" /><h2 className="text-base font-semibold text-ink">{title}</h2></div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => <li key={item} className="border-l-2 border-accent/50 pl-4 text-sm leading-7 text-muted">{item}</li>)}
      </ul>
    </section>
  )
}

function QuestionInsights({ copy, items }) {
  if (!items.length) return null
  return (
    <section className="border border-line bg-surface p-5 md:col-span-2">
      <div className="flex items-center gap-2"><MessageSquareText size={17} className="text-accent" /><h2 className="text-base font-semibold text-ink">{copy.questionSummaryTitle}</h2></div>
      <div className="mt-4 space-y-4">{items.map((item) => <article key={`${item.questionSummary}-${item.answerSummary}`} className="border-l-2 border-accent/50 pl-4"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-accent">{copy.questionTypes[item.questionType]} · {copy.questionOutcomes[item.outcome]}</p><p className="mt-2 text-sm leading-7 text-ink">{item.questionSummary}</p><p className="mt-2 text-sm leading-7 text-muted">{item.answerSummary}</p></article>)}</div>
    </section>
  )
}

export default function InterviewPreparationHub({ copy, locale }) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [seniority, setSeniority] = useState('')
  const [report, setReport] = useState(null)
  const [status, setStatus] = useState('idle')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setReport(null)
    try {
      const params = new URLSearchParams({ company, role })
      if (seniority) params.set('seniority', seniority)
      const response = await fetch(`/api/v1/interview-preparation/contributions?${params}`, { cache: 'no-store' })
      const body = await response.json()
      if (!response.ok) throw new Error()
      setReport(body.data)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent">{copy.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{copy.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{copy.description}</p>
          </div>
          <Link href={`/${locale}/surveys/interview-preparation`} className="inline-flex shrink-0 items-center gap-2 border border-ink px-4 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-canvas">
            {copy.contribute}<ArrowRight size={16} />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-3 border-y border-line py-5 sm:grid-cols-[1fr_1fr_10rem_auto]">
          <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder={copy.companyPlaceholder} required className="border border-line bg-canvas px-3 py-3 text-sm outline-none focus:border-accent" />
          <input value={role} onChange={(event) => setRole(event.target.value)} placeholder={copy.rolePlaceholder} required className="border border-line bg-canvas px-3 py-3 text-sm outline-none focus:border-accent" />
          <Select value={seniority} onChange={(event) => setSeniority(event.target.value)} aria-label={copy.seniorityLabel}>
            <option value="">{copy.allSeniorities}</option>
            {preparationSeniorities.map((value) => <option key={value} value={value}>{copy.seniorities[value]}</option>)}
          </Select>
          <button disabled={status === 'loading'} className="inline-flex items-center justify-center gap-2 bg-ink px-4 py-3 text-sm font-semibold text-canvas transition hover:bg-accent disabled:opacity-60"><Search size={16} />{status === 'loading' ? copy.loading : copy.search}</button>
        </form>

        {status === 'error' && <p className="mt-5 text-sm text-danger">{copy.error}</p>}
        {report?.status === 'insufficient' && (
          <div className="mt-7 border border-line bg-surfaceMuted p-6">
            <LockKeyhole size={18} className="text-accent" />
            <h2 className="mt-3 text-lg font-semibold">{copy.insufficientTitle}</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-muted">{copy.insufficientDescription.replace('{count}', report.sampleSize).replace('{minimum}', report.minimumSampleSize)}</p>
          </div>
        )}
        {report?.status === 'live' && (
          <div className="mt-7">
            <div className="flex items-center gap-3 border-b border-line pb-5"><BarChart3 size={18} className="text-accent" /><p className="text-sm text-muted">{copy.sampleLabel.replace('{count}', report.sampleSize)}</p></div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <RankedList title={copy.topicTitle} items={report.topics} labels={copy.topics} sampleSize={report.sampleSize} />
              <RankedList title={copy.skillTitle} items={report.skills} labels={copy.skills} sampleSize={report.sampleSize} />
              <RankedList title={copy.formatTitle} items={report.formats} labels={copy.formats} sampleSize={report.sampleSize} />
              <RankedList title={copy.stageTitle} items={report.stages} labels={copy.stages} sampleSize={report.sampleSize} />
              <QuestionInsights copy={copy} items={report.questionInsights} />
              <SummaryList icon={BarChart3} title={copy.preparationTipTitle} items={report.preparationTips} />
            </div>
            <p className="mt-6 text-xs leading-6 text-muted">{copy.privacyNote}</p>
          </div>
        )}
      </div>
    </div>
  )
}
