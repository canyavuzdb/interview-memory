import { EyeOff, ShieldCheck, UserRoundX } from 'lucide-react'
import SampleDataBadge from '@/components/SampleDataBadge'

const icons = [UserRoundX, EyeOff, ShieldCheck]

export default function TrustPanel({ copy, sampleSize }) {
  return (
    <aside className="border border-[var(--line-strong)] bg-surface p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-24 lg:p-8">
      <SampleDataBadge label={copy.dataLabel} value={sampleSize} />
      <h1 className="mt-7 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-ink sm:text-5xl lg:text-6xl">
        {copy.title}
      </h1>
      <p className="mt-5 max-w-lg text-base leading-7 text-muted">
        {copy.description}
      </p>

      <div className="mt-9 hidden border-t border-line pt-6 lg:block">
        <ul className="space-y-5">
          {copy.items.map((item, index) => {
            const Icon = icons[index]

            return (
              <li key={item} className="flex items-center gap-3 text-sm font-medium text-ink">
                <span className="grid h-9 w-9 shrink-0 place-items-center border border-[var(--accent-border)] text-accentDark">
                  <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                </span>
                {item}
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
