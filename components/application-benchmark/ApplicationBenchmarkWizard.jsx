'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import BenchmarkResultPreview from '@/components/application-benchmark/BenchmarkResultPreview'
import StepConsentReview from '@/components/application-benchmark/StepConsentReview'
import StepContext from '@/components/application-benchmark/StepContext'
import StepFunnel from '@/components/application-benchmark/StepFunnel'
import SurveyFlowLayout from '@/components/survey-flow/SurveyFlowLayout'
import SurveyWizardFrame from '@/components/survey-flow/SurveyWizardFrame'
import { useApplicationBenchmarkForm } from '@/hooks/useApplicationBenchmarkForm'
import { submitApplicationBenchmark } from '@/lib/api/submitApplicationBenchmark'
import { getApplicationBenchmarkWarnings } from '@/lib/validation/applicationBenchmark'

export default function ApplicationBenchmarkWizard({ copy, locale, sampleSize }) {
  const { state, dispatch, validateCurrentStep } = useApplicationBenchmarkForm(copy.validation)
  const [quota, setQuota] = useState(null)
  const idempotencyKeyRef = useRef(null)
  const stepHeadingRef = useRef(null)
  const warnings = getApplicationBenchmarkWarnings(state, copy.validation)
  const quotaExhausted = quota?.mode === 'anonymous' && quota.remaining === 0

  useEffect(() => {
    if (state.step > 1) stepHeadingRef.current?.focus()
  }, [state.step])

  function setField(field, value) {
    idempotencyKeyRef.current = null
    dispatch({ type: 'SET_FIELD', field, value })
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
      roleLevel: state.roleLevel,
      experienceBand: state.experienceBand,
      targetRegion: state.targetRegion,
      employmentType: state.employmentType || null,
      workMode: state.workMode || null,
      isCurrentlyEmployed: state.isCurrentlyEmployed,
      searchStartedAt: state.searchStartedAt,
      searchStatus: state.searchStatus,
      searchEndedAt: state.searchStatus === 'ongoing' ? null : state.searchEndedAt || null,
      applicationsCount: Number(state.applicationsCount),
      humanResponsesCount: Number(state.humanResponsesCount),
      anyInterviewsCount: Number(state.anyInterviewsCount),
      hrInterviewsCount: Number(state.hrInterviewsCount || 0),
      technicalInterviewsCount: Number(state.technicalInterviewsCount || 0),
      offersCount: Number(state.offersCount || 0),
      acceptedOffersCount: Number(state.acceptedOffersCount || 0),
      employmentStartedCount: Number(state.employmentStartedCount || 0),
      countsAreEstimated: state.countsAreEstimated,
      locale,
      consentGranted: state.consentGranted,
    }
    idempotencyKeyRef.current ??= globalThis.crypto.randomUUID()
    const result = await submitApplicationBenchmark(
      payload,
      idempotencyKeyRef.current,
    )
    window.dispatchEvent(
      new CustomEvent('survey-quota-updated', {
        detail: { survey: 'application-benchmark' },
      }),
    )
    dispatch(
      result.success
        ? { type: 'SUBMIT_SUCCESS', result }
        : { type: 'SUBMIT_ERROR' },
    )
  }

  const stepCopy = copy.steps[`step${state.step}`]

  return (
    <SurveyFlowLayout
      introCopy={copy.trustPanel}
      onQuotaChange={setQuota}
      sampleSize={sampleSize}
      survey="application-benchmark"
    >
      {quotaExhausted ? (
        <div className="flex min-h-[420px] flex-col justify-center">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-accent">
            {copy.trustPanel.quota.anonymousTitle}
          </p>
          <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-[-0.045em] text-ink">
            {copy.trustPanel.quota.blockedTitle}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            {copy.trustPanel.quota.blockedDescription}
          </p>
          <Link
            className="mt-7 inline-flex h-12 w-fit items-center justify-center bg-ink px-6 text-sm font-semibold text-surface transition-colors hover:bg-accentDark"
            href={`/${locale}/account`}
          >
            {copy.trustPanel.quota.blockedAction}
          </Link>
        </div>
      ) : state.submitStatus === 'success' ? (
        <BenchmarkResultPreview copy={copy.success} contextCopy={copy.steps.step1} locale={locale} state={state} />
      ) : (
        <SurveyWizardFrame
          copy={copy}
          current={state.step}
          errorMessage={Object.keys(state.errors).length > 0 ? copy.validation.summary : ''}
          headingRef={stepHeadingRef}
          onBack={goBack}
          onNext={state.step === 3 ? completeForm : goNext}
          suppressValidationSummary
          stepCopy={stepCopy}
          submitError={copy.submitError}
          submitStatus={state.submitStatus}
        >
          {state.step === 1 && (
            <StepContext copy={stepCopy} errors={state.errors} locale={locale} setField={setField} state={state} />
          )}
          {state.step === 2 && (
            <StepFunnel
              copy={stepCopy}
              errors={state.errors}
              locale={locale}
              setField={setField}
              state={state}
              warnings={warnings}
            />
          )}
          {state.step === 3 && (
            <StepConsentReview
              copy={stepCopy}
              errors={state.errors}
              setField={setField}
              state={state}
            />
          )}
        </SurveyWizardFrame>
      )}
    </SurveyFlowLayout>
  )
}
