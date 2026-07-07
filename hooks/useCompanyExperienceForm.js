'use client'

import { useEffect, useReducer } from 'react'
import { INITIAL_COMPANY_EXPERIENCE_STATE } from '@/lib/constants/companyExperience'
import { validateCompanyExperienceStep } from '@/lib/validation/companyExperience'

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD': {
      const nextState = {
        ...state,
        [action.field]: action.value,
        dirty: true,
        errors: { ...state.errors, [action.field]: undefined },
      }

      if (action.field === 'gotResponse' && action.value === false) {
        nextState.responseTimeDays = ''
        nextState.gotRejectionReason = null
        nextState.rejectionReasonQuality = ''
      }

      return nextState
    }
    case 'GO_TO_STEP':
      return { ...state, step: action.step, errors: {} }
    case 'SET_ERRORS':
      return { ...state, errors: action.errors }
    case 'SUBMIT_START':
      return { ...state, submitStatus: 'submitting', errors: {} }
    case 'SUBMIT_SUCCESS':
      return { ...state, submitStatus: 'success', dirty: false }
    case 'SUBMIT_ERROR':
      return { ...state, submitStatus: 'error' }
    default:
      return state
  }
}

export function useCompanyExperienceForm(validationMessages) {
  const [state, dispatch] = useReducer(reducer, INITIAL_COMPANY_EXPERIENCE_STATE)

  useEffect(() => {
    function warnBeforeUnload(event) {
      if (!state.dirty || state.submitStatus === 'success') return
      event.preventDefault()
    }

    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [state.dirty, state.submitStatus])

  function validateCurrentStep() {
    const errors = validateCompanyExperienceStep(state.step, state, validationMessages)
    dispatch({ type: 'SET_ERRORS', errors })
    return Object.keys(errors).length === 0
  }

  return { state, dispatch, validateCurrentStep }
}
