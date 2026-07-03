import { EyeOff, LockKeyhole, ShieldCheck, UserCheck } from 'lucide-react'

const trustIcons = [
  {
    icon: UserCheck,
  },
  {
    icon: EyeOff,
  },
  {
    icon: ShieldCheck,
  },
  {
    icon: LockKeyhole,
  },
]

export default function AnonymousTrustSection({ items }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-4">
        {items.map((item, index) => {
          const Icon = trustIcons[index].icon

          return (
            <div
              key={item.title}
              className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-sm transition hover:border-[var(--accent-border)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-accentDark">
                <Icon size={21} />
              </div>
              <h3 className="text-base font-semibold tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
