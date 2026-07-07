'use client'

import { useEffect, useReducer } from 'react'
import { INITIAL_SALARY_BENCHMARK_STATE } from '@/lib/constants/salaryBenchmark'
import { validateSalaryBenchmarkStep } from '@/lib/validation/salaryBenchmark'

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD': {
      const nextState = {
        ...state,
        [action.field]: action.value,
        dirty: true,
        errors: { ...state.errors, [action.field]: undefined },
      }

      if (action.field === 'jobPostHadSalary' && action.value === 'no') {
        nextState.postedSalaryMin = ''
        nextState.postedSalaryMax = ''
      }
      
      if (action.field === 'jobPostHadSalary' && action.value === 'yes_fixed') {
        nextState.postedSalaryMax = ''
      }
      
      if (action.field === 'negotiated' && action.value === false) {
        nextState.afterNegotiation = ''
      }

      return nextState
    }
    case 'TOGGLE_BENEFIT': {
      const isSelected = state.benefitsOffered.includes(action.value)
      
      // If "none" is selected, clear everything else
      if (action.value === 'none') {
        return {
          ...state,
          benefitsOffered: isSelected ? [] : ['none'],
          dirty: true,
        }
      }
      
      // Otherwise, toggle the selection and remove "none" if present
      const currentBenefits = state.benefitsOffered.filter(b => b !== 'none')
      const newBenefits = isSelected
        ? currentBenefits.filter(b => b !== action.value)
        : [...currentBenefits, action.value]
        
      return {
        ...state,
        benefitsOffered: newBenefits,
        dirty: true,
      }
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

export function useSalaryBenchmarkForm(validationMessages) {
  const [state, dispatch] = useReducer(reducer, INITIAL_SALARY_BENCHMARK_STATE)

  useEffect(() => {
    function warnBeforeUnload(event) {
      if (!state.dirty || state.submitStatus === 'success') return
      event.preventDefault()
    }

    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [state.dirty, state.submitStatus])

  function validateCurrentStep() {
    const errors = validateSalaryBenchmarkStep(state.step, state, validationMessages)
    dispatch({ type: 'SET_ERRORS', errors })
    return Object.keys(errors).length === 0
  }

  return { state, dispatch, validateCurrentStep }
}
