export default function SurveyNavigation({
  current,
  isSubmitting,
  labels,
  onBack,
  onNext,
  onSkip,
  total = 3,
}) {
  const isFinal = current === total

  return (
    <div className="mt-4 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
      {current > 1 ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 items-center justify-center gap-2 border border-[var(--line-strong)] bg-canvas px-6 text-sm font-semibold text-ink transition-[border-color,background-color,color] duration-200 hover:border-[var(--line-emphasis)] hover:bg-[var(--surface-hover)]"
        >
          <ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />
          {labels.back}
        </button>
      ) : <span />}

      <div className="flex flex-col gap-3 sm:flex-row">
        {isFinal && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isSubmitting}
            className="h-12 border border-[var(--line-strong)] bg-canvas px-5 text-sm font-semibold text-ink transition-[border-color,background-color,color] duration-200 hover:border-[var(--line-emphasis)] hover:bg-[var(--surface-hover)] disabled:cursor-wait disabled:opacity-60"
          >
            {labels.skip}
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="inline-flex h-12 min-w-36 items-center justify-center gap-2 bg-ink px-6 text-sm font-semibold text-surface transition-[background-color,color] duration-200 hover:bg-accentDark disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? labels.loading : isFinal ? labels.complete : labels.next}
          {!isSubmitting && <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}
import { ArrowLeft, ArrowRight } from 'lucide-react'
