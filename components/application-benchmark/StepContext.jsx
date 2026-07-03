import ChoiceGroup from '@/components/application-benchmark/ChoiceGroup'
import FieldError from '@/components/application-benchmark/FieldError'
import {
  EXPERIENCE_BANDS,
  SEARCH_STATUSES,
  WORK_MODES,
} from '@/lib/constants/applicationBenchmark'

const fieldClass =
  'mt-2 w-full border border-[var(--line-strong)] bg-canvas px-4 py-3 text-sm text-ink outline-none transition focus:border-accent'

export default function StepContext({ copy, errors, setField, state }) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="benchmark-role" className="text-sm font-semibold text-ink">
          {copy.fields.role.label}
        </label>
        <input
          id="benchmark-role"
          value={state.role}
          onChange={(event) => setField('role', event.target.value)}
          placeholder={copy.fields.role.placeholder}
          aria-invalid={Boolean(errors.role)}
          aria-describedby={errors.role ? 'benchmark-role-error' : undefined}
          className={fieldClass}
        />
        <FieldError id="benchmark-role-error">{errors.role}</FieldError>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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
            <option value="">{copy.selectPlaceholder}</option>
            {EXPERIENCE_BANDS.map((band) => (
              <option key={band} value={band}>{copy.fields.experienceBand.options[band]}</option>
            ))}
          </select>
          <FieldError>{errors.experienceBand}</FieldError>
        </div>

        <div>
          <label htmlFor="work-mode" className="text-sm font-semibold text-ink">
            {copy.fields.workMode.label}
          </label>
          <select
            id="work-mode"
            value={state.workMode}
            onChange={(event) => setField('workMode', event.target.value)}
            aria-invalid={Boolean(errors.workMode)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>{copy.fields.workMode.options[mode]}</option>
            ))}
          </select>
          <FieldError>{errors.workMode}</FieldError>
        </div>
      </div>

      <ChoiceGroup
        name="employment-status"
        label={copy.fields.isCurrentlyEmployed.label}
        value={state.isCurrentlyEmployed}
        onChange={(value) => setField('isCurrentlyEmployed', value)}
        options={copy.booleanOptions}
        error={errors.isCurrentlyEmployed}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="search-started" className="text-sm font-semibold text-ink">
            {copy.fields.searchStartedAt.label}
          </label>
          <input
            id="search-started"
            type="month"
            value={state.searchStartedAt}
            onChange={(event) => setField('searchStartedAt', event.target.value)}
            aria-invalid={Boolean(errors.searchStartedAt)}
            className={fieldClass}
          />
          <FieldError>{errors.searchStartedAt}</FieldError>
        </div>

        <div>
          <label htmlFor="search-status" className="text-sm font-semibold text-ink">
            {copy.fields.searchStatus.label}
          </label>
          <select
            id="search-status"
            value={state.searchStatus}
            onChange={(event) => setField('searchStatus', event.target.value)}
            aria-invalid={Boolean(errors.searchStatus)}
            className={fieldClass}
          >
            <option value="">{copy.selectPlaceholder}</option>
            {SEARCH_STATUSES.map((status) => (
              <option key={status} value={status}>{copy.fields.searchStatus.options[status]}</option>
            ))}
          </select>
          <FieldError>{errors.searchStatus}</FieldError>
        </div>
      </div>

      {state.searchStatus && state.searchStatus !== 'ongoing' && (
        <div>
          <label htmlFor="search-ended" className="text-sm font-semibold text-ink">
            {copy.fields.searchEndedAt.label}
          </label>
          <input
            id="search-ended"
            type="month"
            value={state.searchEndedAt}
            onChange={(event) => setField('searchEndedAt', event.target.value)}
            aria-invalid={Boolean(errors.searchEndedAt)}
            className={fieldClass}
          />
          <FieldError>{errors.searchEndedAt}</FieldError>
        </div>
      )}
    </div>
  )
}
