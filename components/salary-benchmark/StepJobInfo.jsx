import FieldError from '@/components/application-benchmark/FieldError'
import { SECTORS, EXPERIENCE_BANDS, CITIES } from '@/lib/constants/salaryBenchmark'

const fieldClass =
  'mt-2 w-full border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm text-ink outline-none transition focus:border-accent'

export default function StepJobInfo({ copy, errors, setField, state }) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="salary-role" className="text-sm font-semibold text-ink">
          {copy.fields.role.label}
        </label>
        <input
          id="salary-role"
          value={state.role}
          onChange={(event) => setField('role', event.target.value)}
          placeholder={copy.fields.role.placeholder}
          aria-invalid={Boolean(errors.role)}
          className={fieldClass}
        />
        <FieldError>{errors.role}</FieldError>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="sector" className="text-sm font-semibold text-ink">
            {copy.fields.sector.label}
          </label>
          <select
            id="sector"
            value={state.sector}
            onChange={(event) => setField('sector', event.target.value)}
            aria-invalid={Boolean(errors.sector)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder || 'Seçiniz'}</option>
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>{copy.fields.sector.options[sector]}</option>
            ))}
          </select>
          <FieldError>{errors.sector}</FieldError>
        </div>

        <div>
          <label htmlFor="experience-band" className="text-sm font-semibold text-ink">
            {copy.fields.experienceBand.label}
          </label>
          <select
            id="experience-band"
            value={state.experienceBand}
            onChange={(event) => setField('experienceBand', event.target.value)}
            aria-invalid={Boolean(errors.experienceBand)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder || 'Seçiniz'}</option>
            {EXPERIENCE_BANDS.map((band) => (
              <option key={band} value={band}>{copy.fields.experienceBand.options[band]}</option>
            ))}
          </select>
          <FieldError>{errors.experienceBand}</FieldError>
        </div>
      </div>

      <div>
        <label htmlFor="city" className="text-sm font-semibold text-ink">
          {copy.fields.city.label}
        </label>
        <select
          id="city"
          value={state.city}
          onChange={(event) => setField('city', event.target.value)}
          aria-invalid={Boolean(errors.city)}
          className={fieldClass}
        >
          <option value="">{copy.selectPlaceholder || 'Seçiniz'}</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>{copy.fields.city.options[city]}</option>
          ))}
        </select>
        <FieldError>{errors.city}</FieldError>
      </div>
    </div>
  )
}
