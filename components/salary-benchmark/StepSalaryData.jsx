import ChoiceGroup from '@/components/application-benchmark/ChoiceGroup'
import FieldError from '@/components/application-benchmark/FieldError'
import { SALARY_DISCLOSURE_TYPES } from '@/lib/constants/salaryBenchmark'

const fieldClass =
  'mt-2 w-full border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm text-ink outline-none transition focus:border-accent'

export default function StepSalaryData({ copy, errors, setField, state, warnings }) {
  return (
    <div className="space-y-8">
      {/* Job Post Salary */}
      <div>
        <label htmlFor="job-post-salary" className="text-sm font-semibold text-ink">
          {copy.fields.jobPostHadSalary.label}
        </label>
        <select
          id="job-post-salary"
          value={state.jobPostHadSalary}
          onChange={(event) => setField('jobPostHadSalary', event.target.value)}
          aria-invalid={Boolean(errors.jobPostHadSalary)}
          className={fieldClass}
        >
          <option value="">{copy.selectPlaceholder || 'Seçiniz'}</option>
          {SALARY_DISCLOSURE_TYPES.map((type) => (
            <option key={type} value={type}>{copy.fields.jobPostHadSalary.options[type]}</option>
          ))}
        </select>
        <FieldError>{errors.jobPostHadSalary}</FieldError>

        {state.jobPostHadSalary === 'yes_range' && (
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="posted-min" className="text-sm font-semibold text-ink">{copy.fields.postedSalaryMin.label}</label>
              <div className="relative mt-2">
                <input
                  id="posted-min"
                  type="number"
                  value={state.postedSalaryMin}
                  onChange={(event) => setField('postedSalaryMin', event.target.value)}
                  className="w-full border border-[var(--line-strong)] bg-canvas py-3 pl-4 pr-12 text-sm text-ink outline-none transition focus:border-accent"
                />
                <span className="absolute inset-y-0 right-4 flex items-center text-sm text-muted">₺</span>
              </div>
              <FieldError>{errors.postedSalaryMin}</FieldError>
            </div>
            <div>
              <label htmlFor="posted-max" className="text-sm font-semibold text-ink">{copy.fields.postedSalaryMax.label}</label>
              <div className="relative mt-2">
                <input
                  id="posted-max"
                  type="number"
                  value={state.postedSalaryMax}
                  onChange={(event) => setField('postedSalaryMax', event.target.value)}
                  className="w-full border border-[var(--line-strong)] bg-canvas py-3 pl-4 pr-12 text-sm text-ink outline-none transition focus:border-accent"
                />
                <span className="absolute inset-y-0 right-4 flex items-center text-sm text-muted">₺</span>
              </div>
              <FieldError>{errors.postedSalaryMax}</FieldError>
            </div>
          </div>
        )}

        {state.jobPostHadSalary === 'yes_fixed' && (
          <div className="mt-4 w-full sm:w-1/2">
            <label htmlFor="posted-fixed" className="text-sm font-semibold text-ink">{copy.fields.postedSalaryMin.label}</label>
            <div className="relative mt-2">
              <input
                id="posted-fixed"
                type="number"
                value={state.postedSalaryMin}
                onChange={(event) => setField('postedSalaryMin', event.target.value)}
                className="w-full border border-[var(--line-strong)] bg-canvas py-3 pl-4 pr-12 text-sm text-ink outline-none transition focus:border-accent"
              />
              <span className="absolute inset-y-0 right-4 flex items-center text-sm text-muted">₺</span>
            </div>
            <FieldError>{errors.postedSalaryMin}</FieldError>
          </div>
        )}
      </div>

      <hr className="border-[var(--line-strong)] opacity-50" />

      {/* Expected & Offered */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="expected-salary" className="text-sm font-semibold text-ink">{copy.fields.expectedSalary.label}</label>
          <div className="relative mt-2">
            <input
              id="expected-salary"
              type="number"
              value={state.expectedSalary}
              onChange={(event) => setField('expectedSalary', event.target.value)}
              className="w-full border border-[var(--line-strong)] bg-canvas py-3 pl-4 pr-12 text-sm text-ink outline-none transition focus:border-accent"
            />
            <span className="absolute inset-y-0 right-4 flex items-center text-sm text-muted">₺</span>
          </div>
          <FieldError>{errors.expectedSalary}</FieldError>
        </div>
        <div>
          <label htmlFor="offered-salary" className="text-sm font-semibold text-ink">{copy.fields.offeredSalary.label}</label>
          <div className="relative mt-2">
            <input
              id="offered-salary"
              type="number"
              value={state.offeredSalary}
              onChange={(event) => setField('offeredSalary', event.target.value)}
              className="w-full border border-[var(--line-strong)] bg-canvas py-3 pl-4 pr-12 text-sm text-ink outline-none transition focus:border-accent"
            />
            <span className="absolute inset-y-0 right-4 flex items-center text-sm text-muted">₺</span>
          </div>
          <FieldError>{errors.offeredSalary}</FieldError>
        </div>
      </div>

      <hr className="border-[var(--line-strong)] opacity-50" />

      {/* Negotiation */}
      <ChoiceGroup
        name="negotiated"
        label={copy.fields.negotiated.label}
        value={state.negotiated}
        onChange={(value) => setField('negotiated', value)}
        options={copy.booleanOptions}
        error={errors.negotiated}
      />

      {state.negotiated === true && (
        <div className="w-full sm:w-1/2">
          <label htmlFor="after-negotiation" className="text-sm font-semibold text-ink">{copy.fields.afterNegotiation.label}</label>
          <div className="relative mt-2">
            <input
              id="after-negotiation"
              type="number"
              value={state.afterNegotiation}
              onChange={(event) => setField('afterNegotiation', event.target.value)}
              className="w-full border border-[var(--line-strong)] bg-canvas py-3 pl-4 pr-12 text-sm text-ink outline-none transition focus:border-accent"
            />
            <span className="absolute inset-y-0 right-4 flex items-center text-sm text-muted">₺</span>
          </div>
          <FieldError>{errors.afterNegotiation}</FieldError>
        </div>
      )}

      {warnings.length > 0 && (
        <ul className="mt-4 list-disc space-y-1 pl-4 text-sm text-accent">
          {warnings.map((w, idx) => (
            <li key={idx}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
