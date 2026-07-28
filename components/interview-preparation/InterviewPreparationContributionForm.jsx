'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Plus, Trash2 } from 'lucide-react'

import {
  preparationFormats,
  preparationQuestionOutcomes,
  preparationQuestionTypes,
  preparationSeniorities,
  preparationSkills,
  preparationStages,
  preparationTopics,
} from '@/lib/interview-preparation/contracts'
import { submitInterviewPreparation } from '@/lib/api/submitInterviewPreparation'

const emptyStage = () => ({
  stageCode: '',
  formatCodes: [],
  topicCodes: [],
  skillCodes: [],
  questionEntries: [emptyQuestion()],
  preparationTip: '',
})

function emptyQuestion() {
  return { questionType: '', questionSummary: '', answerSummary: '', outcome: '' }
}

function CheckboxList({ label, description, options, labels, value, onChange, maximum }) {
  function toggle(option) {
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : value.length < maximum ? [...value, option] : value,
    )
  }

  return (
    <fieldset className="border-t border-line pt-5">
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      <div className="mt-4 grid border-l border-t border-line sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 border-b border-r border-line px-3 py-3 text-sm transition ${value.includes(option) ? 'bg-accent/10 text-ink' : 'bg-canvas text-muted hover:bg-surface'}`}
          >
            <input type="checkbox" checked={value.includes(option)} onChange={() => toggle(option)} className="h-4 w-4 accent-[var(--accent)]" />
            {labels[option]}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function QuestionEntry({ copy, entry, index, onChange, onRemove, removable }) {
  const set = (field, value) => onChange({ ...entry, [field]: value })
  return (
    <div className="border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-accent">{copy.questionNumber.replace('{number}', String(index + 1).padStart(2, '0'))}</p>{removable && <button type="button" onClick={onRemove} className="text-xs font-semibold text-muted hover:text-danger">{copy.removeQuestion}</button>}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select required value={entry.questionType} onChange={(event) => set('questionType', event.target.value)} className="border border-line bg-canvas px-3 py-3 text-sm"><option value="">{copy.questionTypeLabel}</option>{preparationQuestionTypes.map((value) => <option key={value} value={value}>{copy.questionTypes[value]}</option>)}</select>
        <select required value={entry.outcome} onChange={(event) => set('outcome', event.target.value)} className="border border-line bg-canvas px-3 py-3 text-sm"><option value="">{copy.outcomeLabel}</option>{preparationQuestionOutcomes.map((value) => <option key={value} value={value}>{copy.questionOutcomes[value]}</option>)}</select>
      </div>
      <label className="mt-4 block text-sm font-semibold text-ink">{copy.questionSummaryLabel}<span className="mt-1 block text-xs font-normal leading-5 text-muted">{copy.questionSummaryHint}</span><textarea required minLength={20} maxLength={480} value={entry.questionSummary} onChange={(event) => set('questionSummary', event.target.value)} className="mt-3 min-h-24 w-full resize-y border border-line bg-canvas p-3 text-sm font-normal leading-6 text-ink outline-none focus:border-accent" placeholder={copy.questionSummaryPlaceholder} /></label>
      <label className="mt-4 block text-sm font-semibold text-ink">{copy.answerSummaryLabel}<span className="mt-1 block text-xs font-normal leading-5 text-muted">{copy.answerSummaryHint}</span><textarea required minLength={20} maxLength={480} value={entry.answerSummary} onChange={(event) => set('answerSummary', event.target.value)} className="mt-3 min-h-24 w-full resize-y border border-line bg-canvas p-3 text-sm font-normal leading-6 text-ink outline-none focus:border-accent" placeholder={copy.answerSummaryPlaceholder} /></label>
    </div>
  )
}

function StageCard({ copy, index, stage, onChange, onRemove, removable }) {
  const set = (field, value) => onChange({ ...stage, [field]: value })

  return (
    <section className="border border-line bg-surfaceMuted p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
          {copy.stageNumber.replace('{number}', String(index + 1).padStart(2, '0'))}
        </p>
        {removable && (
          <button type="button" onClick={onRemove} className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-danger">
            <Trash2 size={15} />{copy.removeStage}
          </button>
        )}
      </div>

      <div className="mt-5 space-y-6">
        <p className="max-w-2xl text-sm leading-6 text-muted">{copy.stageDescription}</p>
        <label className="block text-sm font-semibold text-ink">
          {copy.stageLabel}
          <select required value={stage.stageCode} onChange={(event) => set('stageCode', event.target.value)} className="mt-3 w-full border border-line bg-canvas px-3 py-3 text-sm font-normal text-ink">
            <option value="">{copy.stagePlaceholder}</option>
            {preparationStages.map((value) => <option key={value} value={value}>{copy.stages[value]}</option>)}
          </select>
        </label>
        <div className="border-t border-line pt-5"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-ink">{copy.questionsLabel}</h3><p className="mt-1 text-xs leading-5 text-muted">{copy.questionsDescription}</p></div>{stage.questionEntries.length < 5 && <button type="button" onClick={() => set('questionEntries', [...stage.questionEntries, emptyQuestion()])} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-accentDark"><Plus size={14} />{copy.addQuestion}</button>}</div><div className="mt-4 space-y-3">{stage.questionEntries.map((entry, questionIndex) => <QuestionEntry key={questionIndex} copy={copy} entry={entry} index={questionIndex} onChange={(value) => set('questionEntries', stage.questionEntries.map((item, itemIndex) => itemIndex === questionIndex ? value : item))} onRemove={() => set('questionEntries', stage.questionEntries.filter((_, itemIndex) => itemIndex !== questionIndex))} removable={stage.questionEntries.length > 1} />)}</div></div>
        <div className="border-t border-line pt-5"><p className="text-sm font-semibold text-ink">{copy.stageSignalsTitle}</p><p className="mt-1 text-xs leading-5 text-muted">{copy.stageSignalsDescription}</p><div className="mt-5 space-y-6"><CheckboxList label={copy.formatLabel} description={copy.formatDescription} options={preparationFormats} labels={copy.formats} value={stage.formatCodes} onChange={(value) => set('formatCodes', value)} maximum={5} /><CheckboxList label={copy.topicLabel} description={copy.topicDescription} options={preparationTopics} labels={copy.topics} value={stage.topicCodes} onChange={(value) => set('topicCodes', value)} maximum={6} /><CheckboxList label={copy.skillLabel} description={copy.skillDescription} options={preparationSkills} labels={copy.skills} value={stage.skillCodes} onChange={(value) => set('skillCodes', value)} maximum={5} /></div></div>
        <label className="block text-sm font-semibold text-ink">
          {copy.preparationTipLabel}
          <span className="mt-1 block text-xs font-normal leading-5 text-muted">{copy.preparationTipHint}</span>
          <textarea required minLength={20} maxLength={480} value={stage.preparationTip} onChange={(event) => set('preparationTip', event.target.value)} className="mt-3 min-h-24 w-full resize-y border border-line bg-canvas p-3 text-sm font-normal leading-6 text-ink outline-none focus:border-accent" placeholder={copy.preparationTipPlaceholder} />
        </label>
      </div>
    </section>
  )
}

export default function InterviewPreparationContributionForm({ copy, locale }) {
  const currentYear = new Date().getFullYear()
  const [form, setForm] = useState({ companyName: '', appliedRole: '', seniority: '', processYear: String(currentYear), stageDetails: [emptyStage()] })
  const [status, setStatus] = useState('idle')
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const updateStage = (index, nextStage) => set('stageDetails', form.stageDetails.map((stage, stageIndex) => stageIndex === index ? nextStage : stage))
  const removeStage = (index) => set('stageDetails', form.stageDetails.filter((_, stageIndex) => stageIndex !== index))

  async function submit(event) {
    event.preventDefault()
    setStatus('loading')
    const result = await submitInterviewPreparation({ ...form, processYear: Number(form.processYear) })
    if (result.success) {
      window.dispatchEvent(
        new CustomEvent('survey-quota-updated', {
          detail: { survey: 'interview-preparation' },
        }),
      )
    }
    setStatus(result.success ? 'success' : 'error')
  }

  if (status === 'success') {
    return <div className="border border-line bg-surface p-8"><Check size={22} className="text-accent" /><h1 className="mt-4 text-2xl font-semibold">{copy.successTitle}</h1><p className="mt-3 text-sm leading-7 text-muted">{copy.successDescription}</p><Link href={`/${locale}/benchmarks#interview-preparation-report`} className="mt-6 inline-flex border border-ink px-4 py-3 text-sm font-semibold">{copy.backToReport}</Link></div>
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <section><div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">01 / {copy.contextTitle}</p><p className="mt-2 text-sm leading-6 text-muted">{copy.contextDescription}</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2">
        <input required value={form.companyName} onChange={(event) => set('companyName', event.target.value)} placeholder={copy.companyPlaceholder} className="border border-line bg-canvas px-3 py-3 text-sm outline-none focus:border-accent" />
        <input required value={form.appliedRole} onChange={(event) => set('appliedRole', event.target.value)} placeholder={copy.rolePlaceholder} className="border border-line bg-canvas px-3 py-3 text-sm outline-none focus:border-accent" />
        <select required value={form.seniority} onChange={(event) => set('seniority', event.target.value)} className="border border-line bg-canvas px-3 py-3 text-sm"><option value="">{copy.seniorityLabel}</option>{preparationSeniorities.map((value) => <option key={value} value={value}>{copy.seniorities[value]}</option>)}</select>
        <input required type="number" min="2020" max={currentYear} value={form.processYear} onChange={(event) => set('processYear', event.target.value)} className="border border-line bg-canvas px-3 py-3 text-sm" />
      </div></section>
      <section><p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">02 / {copy.stageSectionTitle}</p><p className="mt-2 text-sm leading-6 text-muted">{copy.stageSectionDescription}</p><div className="mt-5 space-y-5">{form.stageDetails.map((stage, index) => <StageCard key={index} copy={copy} index={index} stage={stage} onChange={(value) => updateStage(index, value)} onRemove={() => removeStage(index)} removable={form.stageDetails.length > 1} />)}</div></section>
      {form.stageDetails.length < 5 && <button type="button" onClick={() => set('stageDetails', [...form.stageDetails, emptyStage()])} className="inline-flex items-center gap-2 border border-line px-4 py-3 text-sm font-semibold text-ink hover:border-accent"><Plus size={16} />{copy.addStage}</button>}
      {status === 'error' && <p className="text-sm text-danger">{copy.error}</p>}
      <div className="border-t border-line pt-5"><p className="mb-5 border-l-2 border-accent pl-3 text-sm leading-6 text-muted">{copy.reportAccessNote}</p><div className="flex justify-end"><button disabled={status === 'loading'} className="bg-ink px-5 py-3 text-sm font-semibold text-canvas disabled:opacity-60">{status === 'loading' ? copy.loading : copy.submit}</button></div></div>
    </form>
  )
}
