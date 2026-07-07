import { Check } from 'lucide-react'

export default function HRResultPreview({ copy, state }) {
  return (
    <div className="flex min-h-[520px] flex-col justify-center" role="status">
      <div className="grid h-12 w-12 place-items-center border border-[var(--accent-border)] bg-[var(--accent-soft)] text-accentDark">
        <Check size={22} aria-hidden="true" />
      </div>
      <p className="mt-7 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
        {copy.mockLabel}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-ink sm:text-4xl">
        {copy.title}
      </h2>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        {copy.description}
      </p>

      <div className="mt-8 grid grid-cols-2 border-y border-[var(--line-strong)] sm:grid-cols-3">
        <div className="px-4 py-5">
          <p className="font-mono text-lg font-bold tracking-[-0.04em] text-ink">
            {state.companyName || '—'}
          </p>
          <p className="mt-2 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
            {copy.companyLabel}
          </p>
        </div>
        <div className="border-l border-[var(--line-strong)] px-4 py-5">
          <p className="font-mono text-lg font-bold tracking-[-0.04em] text-ink">
            {state.appliedRole || '—'}
          </p>
          <p className="mt-2 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
            {copy.roleLabel}
          </p>
        </div>
        <div className="col-span-2 border-t border-[var(--line-strong)] px-4 py-5 sm:col-span-1 sm:border-l sm:border-t-0">
          <p className="font-mono text-3xl font-bold tracking-[-0.08em] text-ink">
            {state.wasGhosted === true ? '👻' : '✓'}
          </p>
          <p className="mt-2 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
            {copy.ghostingLabel}
          </p>
        </div>
      </div>

      <div className="mt-0 grid grid-cols-2 border-b border-[var(--line-strong)]">
        <div className="px-4 py-5">
          <p className="font-mono text-3xl font-bold tracking-[-0.08em] text-ink">
            {state.processTransparency || '—'}
          </p>
          <p className="mt-2 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
            {copy.transparencyLabel}
          </p>
        </div>
        <div className="border-l border-[var(--line-strong)] px-4 py-5">
          <p className="font-mono text-3xl font-bold tracking-[-0.08em] text-ink">
            {state.hrProfessionalism || '—'}
          </p>
          <p className="mt-2 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-muted">
            {copy.professionalismLabel}
          </p>
        </div>
      </div>
    </div>
  )
}
