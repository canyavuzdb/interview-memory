import { Building2 } from 'lucide-react'

export default function CompanyResultPreview({ copy, state }) {
  const isPositive = Number(state.overallExperience) >= 4
  const isNegative = Number(state.overallExperience) <= 2
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-4">
          <Building2 className="h-8 w-8 text-accent" />
        </div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-accent mb-2">
          {copy.mockLabel}
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {copy.title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          {copy.description}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--line-strong)] bg-canvas p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            {copy.experienceLabel}
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-3xl font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-danger' : 'text-ink'}`}>
              {state.overallExperience} / 5
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--line-strong)] bg-canvas p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            {copy.recommendLabel}
          </p>
          <p className={`text-xl font-bold mt-2 ${state.wouldReapply ? 'text-green-600' : 'text-danger'}`}>
            {state.wouldReapply ? copy.recommendYes : copy.recommendNo}
          </p>
        </div>
      </div>
    </div>
  )
}
