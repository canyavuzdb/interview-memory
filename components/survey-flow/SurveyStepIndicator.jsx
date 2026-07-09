export default function SurveyStepIndicator({ current, labels, total = 3 }) {
  return (
    <div>
      <div
        role="progressbar"
        aria-label={labels.progressLabel}
        aria-valuemin="1"
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={`${current}/${total} · ${labels.items[current - 1]}`}
        className="flex items-center"
      >
        {Array.from({ length: total }, (_, index) => index + 1).map((step, index) => (
          <div key={step} className={`flex items-center ${index < total - 1 ? 'flex-1' : ''}`}>
            <span
              className={`font-mono text-xs font-bold tracking-[0.08em] transition-colors duration-200 ${current === step ? 'text-accentDark' : current > step ? 'text-ink' : 'text-muted'}`}
              aria-current={current === step ? 'step' : undefined}
            >
              {String(step).padStart(2, '0')}
            </span>
            {index < total - 1 && (
              <span className="mx-3 h-px flex-1 overflow-hidden bg-[var(--line-strong)]" aria-hidden="true">
                <span
                  className={`block h-full bg-accent transition-[width] duration-500 ease-out ${current > step ? 'w-full' : 'w-0'}`}
                />
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-accent">
        {labels.items[current - 1]}
      </p>
    </div>
  )
}
