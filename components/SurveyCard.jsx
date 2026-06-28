import Link from 'next/link'
import { ArrowRight, BarChart3, Building2, Clock } from 'lucide-react'

const iconMap = {
  building: Building2,
  chart: BarChart3,
}

export default function SurveyCard({ survey }) {
  const Icon = iconMap[survey.icon] ?? Building2

  return (
    <article className="snap-center rounded-[2rem] border border-[#E2DDD4] bg-[#FFFCF7] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(25,23,20,0.08)] sm:min-w-[420px]">
      <div className="flex items-start justify-between gap-5">
        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#191714] text-[#FFFCF7]">
          <Icon size={23} />
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-[#E2DDD4] bg-[#F7F4EF] px-3 py-1 text-xs font-medium text-[#706A61]">
          <Clock size={13} />
          {survey.duration}
        </div>
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#5B6F64]">
        {survey.eyebrow}
      </p>

      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#191714]">
        {survey.title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-[#706A61]">
        {survey.description}
      </p>

      <div className="mt-5 space-y-2">
        {survey.bullets.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-[#E2DDD4] bg-[#F7F4EF] px-4 py-3 text-sm text-[#4F493F]"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {survey.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[#E2DDD4] bg-[#FFFCF7] px-3 py-1 text-xs text-[#706A61]"
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        href={survey.href}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#191714] px-5 py-3 text-sm font-semibold text-[#FFFCF7] transition hover:-translate-y-0.5 hover:bg-[#31443A]"
      >
        {survey.cta}
        <ArrowRight size={16} />
      </Link>
    </article>
  )
}