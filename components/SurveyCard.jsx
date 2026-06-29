import Link from 'next/link'
import { ArrowRight, BarChart3, Building2, Clock } from 'lucide-react'

const iconMap = {
  building: Building2,
  chart: BarChart3,
}

export default function SurveyCard({ survey }) {
  const Icon = iconMap[survey.icon] ?? Building2

  return (
    <article className="snap-center rounded-[2rem] border border-line bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft sm:min-w-[420px]">
      <div className="flex items-start justify-between gap-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-surface">
          <Icon size={23} />
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-muted">
          <Clock size={13} />
          {survey.duration}
        </div>
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
        {survey.eyebrow}
      </p>

      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-ink">
        {survey.title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-muted">
        {survey.description}
      </p>

      <div className="mt-5 space-y-2">
        {survey.bullets.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-line bg-canvas px-4 py-3 text-sm text-[var(--ink-soft)]"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {survey.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        href={survey.href}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-surface transition hover:-translate-y-0.5 hover:bg-accentDark"
      >
        {survey.cta}
        <ArrowRight size={16} />
      </Link>
    </article>
  )
}
