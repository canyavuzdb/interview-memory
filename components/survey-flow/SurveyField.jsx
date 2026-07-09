import { ChevronDown } from 'lucide-react'
import { cloneElement } from 'react'

export const surveyControlClass =
  'mt-2 w-full border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm leading-5 text-ink outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-muted hover:border-[var(--line-emphasis)] focus:border-accent focus:bg-surface focus:ring-4 focus:ring-[var(--accent-ring)] aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-[rgba(155,74,69,0.14)]'

export function SurveyFieldError({ children, id }) {
  if (!children) return null

  return (
    <p id={id} role="alert" className="mt-2 flex items-start gap-2 text-xs leading-5 text-danger">
      <span aria-hidden="true" className="mt-[0.45rem] h-1 w-1 shrink-0 bg-danger" />
      {children}
    </p>
  )
}

export function SurveyField({ children, className = '', error, hint, id, label, labelAccessory }) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {labelAccessory}
      </div>
      {hint && <p id={hintId} className="mt-1.5 text-xs leading-5 text-muted">{hint}</p>}
      {cloneElement(children, { 'aria-describedby': describedBy })}
      <SurveyFieldError id={errorId}>{error}</SurveyFieldError>
    </div>
  )
}

export function SurveySelect({ children, className = '', ...props }) {
  return (
    <div className="relative mt-2">
      <select {...props} className={`${surveyControlClass} appearance-none pr-11 ${className}`}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        strokeWidth={1.8}
      />
    </div>
  )
}
