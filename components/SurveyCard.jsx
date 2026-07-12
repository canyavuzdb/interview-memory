import Link from 'next/link'
import { ArrowRight, BarChart3, Building2, Clock, UserSearch, Wallet } from 'lucide-react'

const iconMap = {
  building: Building2,
  chart: BarChart3,
  userSearch: UserSearch,
  wallet: Wallet,
}

export default function SurveyCard({ survey, includesLabel }) {
  const Icon = iconMap[survey.icon] ?? Building2

  return (
    <article className="group relative overflow-hidden border border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-soft">
      <div className="flex items-center justify-between gap-5 border-b border-[var(--line-strong)] px-5 py-4 sm:px-7">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
          {survey.eyebrow}
        </span>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
          <Clock size={13} aria-hidden="true" />
          {survey.duration}
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col p-6 sm:p-8 lg:border-r lg:border-[var(--line-strong)]">
          <span className="grid h-11 w-11 place-items-center border border-ink bg-ink text-surface transition-colors duration-300 group-hover:bg-accentDark">
            <Icon size={20} aria-hidden="true" />
          </span>

          <h3 className="mt-8 max-w-xl text-3xl font-semibold tracking-[-0.05em] text-ink sm:text-4xl">
            {survey.title}
          </h3>

          <p className="mt-5 max-w-xl text-base leading-7 text-muted">
            {survey.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
            {survey.tags.map((tag, tagIndex) => (
              <span key={tag} className="inline-flex items-center gap-3">
                {tagIndex > 0 && <span aria-hidden="true">·</span>}
                {tag}
              </span>
            ))}
          </div>

          <Link
            href={survey.href}
            className="mt-9 inline-flex min-h-12 w-full items-center justify-between border border-ink bg-ink px-5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-surface transition-colors duration-300 hover:bg-accentDark sm:w-fit sm:min-w-64"
          >
            {survey.cta}
            <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <div className="border-t border-[var(--line-strong)] p-6 sm:p-8 lg:border-t-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
            {includesLabel}
          </p>
          <ol className="mt-5 border-t border-[var(--line-strong)]">
            {survey.bullets.map((item) => (
              <li
                key={item}
                className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-3 border-b border-line py-4 text-sm leading-6 text-[var(--ink-soft)]"
              >
                <span className="mt-[0.65rem] h-1 w-1 bg-accent" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  )
}
