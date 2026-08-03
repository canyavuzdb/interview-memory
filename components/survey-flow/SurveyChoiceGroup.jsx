import { SurveyFieldError } from '@/components/survey-flow/SurveyField'

export default function SurveyChoiceGroup({ error, hideError = false, label, name, onChange, options, required = false, value }) {
  const errorId = error && !hideError ? `${name}-error` : undefined
  const normalizedOptions = Array.isArray(options)
    ? options
    : Object.entries(options ?? {}).map(([optionValue, optionLabel]) => ({
        value: optionValue,
        label: optionLabel,
      }))

  return (
    <fieldset aria-describedby={errorId} aria-invalid={Boolean(error)}>
      <legend className={`text-sm font-semibold ${error ? 'text-danger' : 'text-ink'}`}>
        {label}{required ? <span aria-hidden="true" className={`ml-1 ${error ? 'text-danger' : 'text-accent'}`}>*</span> : null}
      </legend>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {normalizedOptions.map((option) => {
          const selected = value === option.value

          return (
            <label
              key={String(option.value)}
              className={`cursor-pointer border px-4 py-3 text-center text-sm font-medium leading-5 transition-[border-color,background-color,color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-4 focus-within:ring-[var(--accent-ring)] ${selected ? 'border-accent bg-[var(--accent-soft)] text-accentDark' : 'border-[var(--line-strong)] bg-canvas text-muted hover:border-[var(--line-emphasis)] hover:bg-surface hover:text-ink'}`}
            >
              <input
                type="radio"
                name={name}
                value={String(option.value)}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          )
        })}
      </div>
      {!hideError && <SurveyFieldError id={errorId}>{error}</SurveyFieldError>}
    </fieldset>
  )
}
