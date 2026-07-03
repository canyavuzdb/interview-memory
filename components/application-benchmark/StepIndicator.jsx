export default function StepIndicator({ current, labels }) {
  return (
    <div>
      <div
        role="progressbar"
        aria-label={labels.progressLabel}
        aria-valuemin="1"
        aria-valuemax="3"
        aria-valuenow={current}
        className="flex items-center"
      >
        {[1, 2, 3].map((step, index) => (
          <div key={step} className={`flex items-center ${index < 2 ? 'flex-1' : ''}`}>
            <span
              className={`font-mono text-xs font-bold ${current === step ? 'text-accentDark' : current > step ? 'text-ink' : 'text-muted'}`}
              aria-current={current === step ? 'step' : undefined}
            >
              {String(step).padStart(2, '0')}
            </span>
            {index < 2 && (
              <span className="mx-3 h-px flex-1 bg-[var(--line-strong)]" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-accent">
        {labels.items[current - 1]}
      </p>
    </div>
  )
}
