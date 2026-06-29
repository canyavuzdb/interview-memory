export default function CommunityStats({ copy }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-line bg-ink p-6 text-surface shadow-[var(--shadow-deep)] md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--inverse-muted)]">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-5 text-sm leading-7 text-[var(--inverse-soft)]">
              {copy.description}
            </p>
            <p className="mt-4 text-xs leading-5 text-[var(--inverse-subtle)]">
              {copy.note}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {copy.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.5rem] border border-[var(--inverse-line)] bg-[var(--inverse-overlay)] p-5"
              >
                <p className="text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-surface">
                  {stat.label}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--inverse-subtle)]">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
