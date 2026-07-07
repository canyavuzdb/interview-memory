'use client'

import { useEffect, useRef } from 'react'
import HRResultPreview from '@/components/hr-process/HRResultPreview'
import StepCompanyInfo from '@/components/hr-process/StepCompanyInfo'
import StepProcessReview from '@/components/hr-process/StepProcessReview'
import StepRatings from '@/components/hr-process/StepRatings'
import SurveyFlowLayout from '@/components/survey-flow/SurveyFlowLayout'
import SurveyWizardFrame from '@/components/survey-flow/SurveyWizardFrame'
import { useHRProcessForm } from '@/hooks/useHRProcessForm'
import { submitHRProcess } from '@/lib/api/submitHRProcess'
import { getHRProcessWarnings } from '@/lib/validation/hrProcess'

export default function HRProcessWizard({ copy, sampleSize }) {
  const { state, dispatch, validateCurrentStep } = useHRProcessForm(copy.validation)
  const stepHeadingRef = useRef(null)
  const warnings = getHRProcessWarnings(state, copy.validation)

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

  async function completeForm() {
    if (!validateCurrentStep()) return

    dispatch({ type: 'SUBMIT_START' })
    const payload = {
      companyName: state.companyName,
      appliedRole: state.appliedRole,
      processYear: state.processYear,
      promisedTimeline: state.promisedTimeline,
      promisedDays: state.promisedTimeline === 'yes' ? Number(state.promisedDays) : null,
      actualDays: state.wasGhosted === true ? null : Number(state.actualDays),
      wasGhosted: state.wasGhosted,
      ghostedAfterStage: state.wasGhosted === true ? state.ghostedAfterStage : null,
      interviewerPrepared: state.interviewerPrepared ? Number(state.interviewerPrepared) : null,
      wasAskedIrrelevant: state.wasAskedIrrelevant,
      irrelevantTypes: state.wasAskedIrrelevant === true ? state.irrelevantTypes : [],
      rejectionShared: state.rejectionShared,
      feedbackUseful:
        state.rejectionShared && state.rejectionShared !== 'no'
          ? Number(state.feedbackUseful) || null
          : null,
      processTransparency: Number(state.processTransparency),
      hrProfessionalism: Number(state.hrProfessionalism),
      wouldRecommendProcess: state.wouldRecommendProcess,
      freeNote: state.freeNote || null,
    }
    const result = await submitHRProcess(payload)
    dispatch({ type: result.success ? 'SUBMIT_SUCCESS' : 'SUBMIT_ERROR' })
  }

  const stepCopy = copy.steps[`step${state.step}`]

  return (
    <SurveyFlowLayout introCopy={copy.trustPanel} sampleSize={sampleSize}>
      {state.submitStatus === 'success' ? (
        <HRResultPreview copy={copy.success} state={state} />
      ) : (
        <SurveyWizardFrame
          copy={copy}
          current={state.step}
          errorMessage={Object.keys(state.errors).length > 0 ? copy.validation.summary : ''}
          headingRef={stepHeadingRef}
          onBack={goBack}
          onNext={state.step === 3 ? completeForm : goNext}
          stepCopy={stepCopy}
          submitError={copy.submitError}
          submitStatus={state.submitStatus}
        >
          {state.step === 1 && (
            <StepCompanyInfo copy={stepCopy} errors={state.errors} setField={setField} state={state} />
          )}
          {state.step === 2 && (
            <StepProcessReview
              booleanOptions={copy.booleanOptions}
              copy={stepCopy}
              errors={state.errors}
              selectPlaceholder={copy.selectPlaceholder}
              setField={setField}
              state={state}
              warnings={warnings}
            />
          )}
          {state.step === 3 && (
            <StepRatings
              copy={stepCopy}
              errors={state.errors}
              selectPlaceholder={copy.selectPlaceholder}
              setField={setField}
              state={state}
            />
          )}
        </SurveyWizardFrame>
      )}
    </SurveyFlowLayout>
  )
}
