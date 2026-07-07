import ChoiceGroup from '@/components/application-benchmark/ChoiceGroup'
import FieldError from '@/components/application-benchmark/FieldError'
import { PROCESS_YEARS } from '@/lib/constants/hrProcess'

const fieldClass =
  'mt-2 w-full border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm text-ink outline-none transition focus:border-accent'

export default function StepCompanyInfo({ copy, errors, setField, state }) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="hr-company-name" className="text-sm font-semibold text-ink">
          {copy.fields.companyName.label}
        </label>
        <input
          id="hr-company-name"
          value={state.companyName}
          onChange={(event) => setField('companyName', event.target.value)}
          placeholder={copy.fields.companyName.placeholder}
          aria-invalid={Boolean(errors.companyName)}
          aria-describedby={errors.companyName ? 'hr-company-name-error' : undefined}
          className={fieldClass}
        />
        <FieldError id="hr-company-name-error">{errors.companyName}</FieldError>
      </div>

      <div>
        <label htmlFor="hr-applied-role" className="text-sm font-semibold text-ink">
          {copy.fields.appliedRole.label}
        </label>
        <input
          id="hr-applied-role"
          value={state.appliedRole}
          onChange={(event) => setField('appliedRole', event.target.value)}
          placeholder={copy.fields.appliedRole.placeholder}
          aria-invalid={Boolean(errors.appliedRole)}
          aria-describedby={errors.appliedRole ? 'hr-applied-role-error' : undefined}
          className={fieldClass}
        />
        <FieldError id="hr-applied-role-error">{errors.appliedRole}</FieldError>
      </div>

      <ChoiceGroup
        name="process-year"
        label={copy.fields.processYear.label}
        value={state.processYear}
        onChange={(value) => setField('processYear', value)}
        options={PROCESS_YEARS.map((year) => ({ value: year, label: year }))}
        error={errors.processYear}
      />
    </div>
  )
}
