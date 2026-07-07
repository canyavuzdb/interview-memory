import { Wallet, TrendingUp } from 'lucide-react'

export default function SalaryResultPreview({ copy, state }) {
  const expected = Number(state.expectedSalary)
  const offered = Number(state.afterNegotiation || state.offeredSalary)
  
  const diffPercent = Math.round(((offered - expected) / expected) * 100)
  
  const isPositive = diffPercent > 0
  const isNeutral = diffPercent === 0
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-4">
          <Wallet className="h-8 w-8 text-accent" />
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
            {copy.expectedLabel}
          </p>
          <p className="text-3xl font-bold text-ink">{expected} ₺</p>
        </div>
        <div className="rounded-xl border border-[var(--line-strong)] bg-canvas p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            {copy.offeredLabel}
          </p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-3xl font-bold text-ink">{offered} ₺</p>
            {!isNeutral && (
              <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-600' : 'bg-danger/10 text-danger'}`}>
                <TrendingUp className={`w-3 h-3 mr-1 ${!isPositive && 'rotate-180'}`} />
                {Math.abs(diffPercent)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-surface-hover p-4 text-center">
        <p className="text-sm font-medium text-ink">
          {copy.fairnessLabel}: <span className={state.feltFairOffer ? 'text-green-600' : 'text-danger'}>{state.feltFairOffer ? copy.fairYes : copy.fairNo}</span>
        </p>
      </div>
    </div>
  )
}
