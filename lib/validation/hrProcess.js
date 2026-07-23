function required(value) {
  return value !== '' && value !== null && value !== undefined
}

function nonNegativeNumber(value) {
  return required(value) && Number.isInteger(Number(value)) && Number(value) >= 0
}

export function validateHRProcessStep(step, state, messages) {
  const errors = {}

  if (step === 1) {
    if (state.companyName.trim().length < 2) errors.companyName = messages.required
    if (state.appliedRole.trim().length < 2) errors.appliedRole = messages.required
    if (!required(state.processYear)) errors.processYear = messages.required
    if (!required(state.applicationMonth)) errors.applicationMonth = messages.required
    if (!required(state.applicationChannel)) errors.applicationChannel = messages.required
    if (!required(state.hadReferral)) errors.hadReferral = messages.required
    if (
      required(state.applicationMonth) &&
      required(state.processYear) &&
      state.applicationMonth.slice(0, 4) !== String(state.processYear)
    ) {
      errors.applicationMonth = messages.monthYearMismatch
    }
  }

  if (step === 2) {
    if (!required(state.promisedTimeline)) errors.promisedTimeline = messages.required
    if (!required(state.wasGhosted)) errors.wasGhosted = messages.required

    if (state.wasGhosted === false && !nonNegativeNumber(state.actualDays)) {
      errors.actualDays = messages.nonNegativeNumber
    }

    if (state.wasGhosted === true && !required(state.ghostedAfterStage)) {
      errors.ghostedAfterStage = messages.required
    }

    if (state.promisedTimeline === 'yes' && !nonNegativeNumber(state.promisedDays)) {
      errors.promisedDays = messages.nonNegativeNumber
    }

    if (!required(state.wasAskedIrrelevant)) errors.wasAskedIrrelevant = messages.required
    if (state.wasAskedIrrelevant === true && state.irrelevantTypes.length === 0) {
      errors.irrelevantTypes = messages.required
    }
    if (!required(state.lastStage)) errors.lastStage = messages.required
    if (!required(state.currentOutcome)) errors.currentOutcome = messages.required
    const ongoing = ['awaiting_response', 'interviewing'].includes(state.currentOutcome)
    if (!ongoing && !required(state.outcomeMonth)) {
      errors.outcomeMonth = messages.required
    }
    if (
      [
        'offer_received',
        'offer_declined',
        'offer_accepted',
        'employment_started',
        'employment_not_started',
      ].includes(state.currentOutcome) &&
      state.lastStage !== 'offer'
    ) {
      errors.lastStage = messages.offerStageRequired
    }
    if (state.currentOutcome === 'interviewing' && state.lastStage === 'application') {
      errors.lastStage = messages.interviewStageRequired
    }
  }

  if (step === 3) {
    if (!required(state.rejectionShared)) errors.rejectionShared = messages.required
    if (!required(state.processTransparency)) errors.processTransparency = messages.required
    if (!required(state.hrProfessionalism)) errors.hrProfessionalism = messages.required
    if (!required(state.wouldRecommendProcess)) errors.wouldRecommendProcess = messages.required
    if (state.freeNote.length > 500) errors.freeNote = messages.noteTooLong
    if (state.consentGranted !== true) errors.consentGranted = messages.consentRequired
  }

  return errors
}

export function getHRProcessWarnings(state, messages) {
  const promised = Number(state.promisedDays)
  const actual = Number(state.actualDays)

  if (Number.isNaN(promised) || Number.isNaN(actual)) return []

  if (state.promisedTimeline === 'yes' && promised < actual) {
    return [messages.timelineGapWarning]
  }

  return []
}
