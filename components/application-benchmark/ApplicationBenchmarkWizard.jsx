'use client'

import { useEffect, useRef } from 'react'
import BenchmarkResultPreview from '@/components/application-benchmark/BenchmarkResultPreview'
import StepContext from '@/components/application-benchmark/StepContext'
import StepNumbersAndSalary from '@/components/application-benchmark/StepNumbersAndSalary'
import StepOptional from '@/components/application-benchmark/StepOptional'
import SurveyFlowLayout from '@/components/survey-flow/SurveyFlowLayout'
import SurveyWizardFrame from '@/components/survey-flow/SurveyWizardFrame'
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
    <SurveyFlowLayout introCopy={copy.trustPanel} sampleSize={sampleSize}>
      {state.submitStatus === 'success' ? (
        <BenchmarkResultPreview copy={copy.success} state={state} />
      ) : (
        <SurveyWizardFrame
          copy={copy}
          current={state.step}
          errorMessage={Object.keys(state.errors).length > 0 ? copy.validation.summary : ''}
          headingRef={stepHeadingRef}
          onBack={goBack}
          onNext={state.step === 3 ? () => completeForm(false) : goNext}
          onSkip={state.step === 3 ? () => completeForm(true) : undefined}
          stepCopy={stepCopy}
          submitError={copy.submitError}
          submitStatus={state.submitStatus}
        >
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
        </SurveyWizardFrame>
      )}
    </SurveyFlowLayout>
  )
}
