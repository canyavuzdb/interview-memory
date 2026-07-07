import ChoiceGroup from '@/components/application-benchmark/ChoiceGroup'
import FieldError from '@/components/application-benchmark/FieldError'
import { BENEFITS } from '@/lib/constants/salaryBenchmark'

export default function StepBenefits({ copy, errors, setField, toggleBenefit, state }) {
  return (
    <div className="space-y-8">
      <div>
        <label className="text-sm font-semibold text-ink block mb-4">
          {copy.fields.benefitsOffered.label}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BENEFITS.map((benefit) => {
            const isSelected = state.benefitsOffered.includes(benefit)
            return (
              <label
                key={benefit}
                className={`flex items-center cursor-pointer border px-4 py-3 text-sm transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent/5 text-ink font-medium'
                    : 'border-[var(--line-strong)] bg-canvas text-muted hover:border-accent/50 hover:text-ink'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isSelected}
                  onChange={() => toggleBenefit(benefit)}
                />
                <span className={`w-4 h-4 mr-3 border flex items-center justify-center transition-colors ${
                  isSelected ? 'border-accent bg-accent' : 'border-muted'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                {copy.fields.benefitsOffered.options[benefit]}
              </label>
            )
          })}
        </div>
      </div>

      <hr className="border-[var(--line-strong)] opacity-50" />

      <ChoiceGroup
        name="felt-fair-offer"
        label={copy.fields.feltFairOffer.label}
        value={state.feltFairOffer}
        onChange={(value) => setField('feltFairOffer', value)}
        options={copy.booleanOptions}
        error={errors.feltFairOffer}
      />
    </div>
  )
}
