'use client'

import { useEffect, useRef } from 'react'
import SalaryResultPreview from '@/components/salary-benchmark/SalaryResultPreview'
import StepJobInfo from '@/components/salary-benchmark/StepJobInfo'
import StepSalaryData from '@/components/salary-benchmark/StepSalaryData'
import StepBenefits from '@/components/salary-benchmark/StepBenefits'
import StepIndicator from '@/components/application-benchmark/StepIndicator'
import TrustPanel from '@/components/application-benchmark/TrustPanel'
import { useSalaryBenchmarkForm } from '@/hooks/useSalaryBenchmarkForm'
import { submitSalaryBenchmark } from '@/lib/api/submitSalaryBenchmark'
import { getSalaryBenchmarkWarnings } from '@/lib/validation/salaryBenchmark'

export default function SalaryBenchmarkWizard({ copy, sampleSize }) {
  const { state, dispatch, validateCurrentStep } = useSalaryBenchmarkForm(copy.validation)
  const stepHeadingRef = useRef(null)
  const warnings = getSalaryBenchmarkWarnings(state, copy.validation)

  useEffect(() => {
    if (state.step > 1) stepHeadingRef.current?.focus()
  }, [state.step])

  function setField(field, value) {
    dispatch({ type: 'SET_FIELD', field, value })
  }

  function toggleBenefit(value) {
    dispatch({ type: 'TOGGLE_BENEFIT', value })
  }

  function goNext() {
    if (!validateCurrentStep()) return
    dispatch({ type: 'GO_TO_STEP', step: Math.min(3, state.step + 1) })
  }

  function goBack() {
    dispatch({ type: 'GO_TO_STEP', step: Math.max(1, state.step - 1) })
  }

  async function completeForm() {
    if (!validateCurrentStep()) return

    dispatch({ type: 'SUBMIT_START' })
    const payload = {
      role: state.role,
      sector: state.sector,
      experienceBand: state.experienceBand,
      city: state.city,
      jobPostHadSalary: state.jobPostHadSalary,
      postedSalaryMin: state.postedSalaryMin ? Number(state.postedSalaryMin) : null,
      postedSalaryMax: state.postedSalaryMax ? Number(state.postedSalaryMax) : null,
      expectedSalary: Number(state.expectedSalary),
      offeredSalary: Number(state.offeredSalary),
      negotiated: state.negotiated,
      afterNegotiation: state.afterNegotiation ? Number(state.afterNegotiation) : null,
      benefitsOffered: state.benefitsOffered,
      feltFairOffer: state.feltFairOffer,
    }
    const result = await submitSalaryBenchmark(payload)
    dispatch({ type: result.success ? 'SUBMIT_SUCCESS' : 'SUBMIT_ERROR' })
  }

  const stepCopy = copy.steps[`step${state.step}`]

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <TrustPanel copy={copy.trustPanel} sampleSize={sampleSize} />

      <section className="border border-[var(--line-strong)] bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        {state.submitStatus === 'success' ? (
          <SalaryResultPreview copy={copy.success} state={state} />
        ) : (
          <form onSubmit={(event) => event.preventDefault()} noValidate>
            <StepIndicator current={state.step} labels={copy.stepIndicator} />
            <p className="mt-5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
              {copy.privacyRow}
            </p>

            <div className="mt-8 border-t border-line pt-7">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-accent">
                {String(state.step).padStart(2, '0')} / 03
              </p>
              <h2
                ref={stepHeadingRef}
                tabIndex="-1"
                className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink outline-none sm:text-3xl"
              >
                {stepCopy.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">{stepCopy.description}</p>
            </div>

            <div className="mt-8">
              {state.step === 1 && (
                <StepJobInfo copy={stepCopy} errors={state.errors} setField={setField} state={state} />
              )}
              {state.step === 2 && (
                <StepSalaryData
                  copy={stepCopy}
                  errors={state.errors}
                  setField={setField}
                  state={state}
                  warnings={warnings}
                />
              )}
              {state.step === 3 && (
                <StepBenefits
                  copy={stepCopy}
                  errors={state.errors}
                  setField={setField}
                  toggleBenefit={toggleBenefit}
                  state={state}
                />
              )}
            </div>

            <div aria-live="polite" className="mt-7 min-h-5 text-sm text-danger">
              {Object.keys(state.errors).length > 0 ? copy.validation.summary : ''}
              {state.submitStatus === 'error' ? copy.submitError : ''}
            </div>

            <div className="mt-4 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
              {state.step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="h-12 border border-[var(--line-strong)] bg-canvas px-6 text-sm font-semibold text-ink transition hover:bg-[var(--surface-hover)]"
                >
                  {copy.navigation.back}
                </button>
              ) : <span />}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={state.step === 3 ? completeForm : goNext}
                  disabled={state.submitStatus === 'submitting'}
                  className="h-12 bg-ink px-6 text-sm font-semibold text-surface transition hover:bg-accentDark disabled:cursor-wait disabled:opacity-60"
                >
                  {state.submitStatus === 'submitting'
                    ? copy.navigation.loading
                    : state.step === 3
                      ? copy.navigation.complete
                      : copy.navigation.next}
                </button>
              </div>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
