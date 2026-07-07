import SurveyNavigation from '@/components/survey-flow/SurveyNavigation'
import SurveyStepIndicator from '@/components/survey-flow/SurveyStepIndicator'

export default function SurveyWizardFrame({
  children,
  copy,
  current,
  errorMessage,
  headingRef,
  onBack,
  onNext,
  onSkip,
  stepCopy,
  submitError,
  submitStatus,
}) {
  return (
    <form onSubmit={(event) => event.preventDefault()} noValidate>
      <SurveyStepIndicator current={current} labels={copy.stepIndicator} />
      <p className="mt-5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
        {copy.privacyRow}
      </p>

      <div className="mt-8 border-t border-line pt-7">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-accent">
          {String(current).padStart(2, '0')} / 03
        </p>
        <h2
          ref={headingRef}
          tabIndex="-1"
          className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink outline-none sm:text-3xl"
        >
          {stepCopy.title}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{stepCopy.description}</p>
      </div>

      <div className="mt-8">{children}</div>

      <div aria-live="polite" className="mt-7 min-h-5 text-sm text-danger">
        {errorMessage}
        {submitStatus === 'error' ? submitError : ''}
      </div>

      <SurveyNavigation
        current={current}
        isSubmitting={submitStatus === 'submitting'}
        labels={copy.navigation}
        onBack={onBack}
        onNext={onNext}
        onSkip={onSkip}
      />
    </form>
  )
}
