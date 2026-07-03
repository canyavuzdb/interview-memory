'use client'

import { useEffect, useRef } from 'react'
import BenchmarkResultPreview from '@/components/application-benchmark/BenchmarkResultPreview'
import StepContext from '@/components/application-benchmark/StepContext'
import StepIndicator from '@/components/application-benchmark/StepIndicator'
import StepNumbersAndSalary from '@/components/application-benchmark/StepNumbersAndSalary'
import StepOptional from '@/components/application-benchmark/StepOptional'
import TrustPanel from '@/components/application-benchmark/TrustPanel'
import { useApplicationBenchmarkForm } from '@/hooks/useApplicationBenchmarkForm'
import { submitApplicationBenchmark } from '@/lib/api/submitApplicationBenchmark'
import { getApplicationBenchmarkWarnings } from '@/lib/validation/applicationBenchmark'

export default function ApplicationBenchmarkWizard({ copy, sampleSize }) {
  const { state, dispatch, validateCurrentStep } = useApplicationBenchmarkForm(copy.validation)
  const stepHeadingRef = useRef(null)
  const warnings = getApplicationBenchmarkWarnings(state, copy.validation)

  useEffect(() => {
    if (state.step > 1) stepHeadingRef.current?.focus()
  }, [state.step])

  function setField(field, value) {
    dispatch({ type: 'SET_FIELD', field, value })
  }

  function goNext() {
    if (!validateCurrentStep()) return
    dispatch({ type: 'GO_TO_STEP', step: Math.min(3, state.step + 1) })
  }

  function goBack() {
    dispatch({ type: 'GO_TO_STEP', step: Math.max(1, state.step - 1) })
  }

  async function completeForm(skipOptional = false) {
    if (!skipOptional && !validateCurrentStep()) return

    dispatch({ type: 'SUBMIT_START' })
    const payload = {
      role: state.role,
      experienceBand: state.experienceBand,
      workMode: state.workMode,
      isCurrentlyEmployed: state.isCurrentlyEmployed,
      searchStartedAt: state.searchStartedAt,
      searchStatus: state.searchStatus,
      searchEndedAt: state.searchStatus === 'ongoing' ? null : state.searchEndedAt || null,
      applicationsCount: Number(state.applicationsCount),
      responsesCount: Number(state.responsesCount),
      interviewsCount: Number(state.interviewsCount),
      offersCount: Number(state.offersCount),
      currentSalaryBand: state.currentSalaryBand || null,
      expectedSalaryBand: state.expectedSalaryBand || null,
      highestOfferBand: Number(state.offersCount) > 0 ? state.highestOfferBand || null : null,
      hadReferral: skipOptional ? null : state.hadReferral,
      sharedPortfolio: skipOptional ? null : state.sharedPortfolio,
      freeNote: skipOptional ? null : state.freeNote || null,
    }
    const result = await submitApplicationBenchmark(payload)
    dispatch({ type: result.success ? 'SUBMIT_SUCCESS' : 'SUBMIT_ERROR' })
  }

  const stepCopy = copy.steps[`step${state.step}`]

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <TrustPanel copy={copy.trustPanel} sampleSize={sampleSize} />

      <section className="border border-[var(--line-strong)] bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        {state.submitStatus === 'success' ? (
          <BenchmarkResultPreview copy={copy.success} state={state} />
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
                <StepContext copy={stepCopy} errors={state.errors} setField={setField} state={state} />
              )}
              {state.step === 2 && (
                <StepNumbersAndSalary
                  copy={stepCopy}
                  errors={state.errors}
                  setField={setField}
                  state={state}
                  warnings={warnings}
                />
              )}
              {state.step === 3 && (
                <StepOptional copy={stepCopy} errors={state.errors} setField={setField} state={state} />
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
                {state.step === 3 && (
                  <button
                    type="button"
                    onClick={() => completeForm(true)}
                    disabled={state.submitStatus === 'submitting'}
                    className="h-12 border border-[var(--line-strong)] bg-canvas px-5 text-sm font-semibold text-ink transition hover:bg-[var(--surface-hover)] disabled:cursor-wait disabled:opacity-60"
                  >
                    {copy.navigation.skip}
                  </button>
                )}
                <button
                  type="button"
                  onClick={state.step === 3 ? () => completeForm(false) : goNext}
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
