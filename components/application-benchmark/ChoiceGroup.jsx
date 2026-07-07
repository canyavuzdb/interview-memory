import FieldError from '@/components/application-benchmark/FieldError'

export default function ChoiceGroup({ error, label, name, onChange, options, value }) {
  const errorId = `${name}-error`
  const normalizedOptions = Array.isArray(options)
    ? options
    : Object.entries(options ?? {}).map(([optionValue, optionLabel]) => ({
        value: optionValue,
        label: optionLabel,
      }))

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {normalizedOptions.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer border px-4 py-3 text-center text-sm font-medium transition ${value === option.value ? 'border-accent bg-[var(--accent-soft)] text-accentDark' : 'border-[var(--line-strong)] bg-canvas text-muted hover:border-[var(--accent-border)] hover:text-ink'}`}
          >
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  )
}
