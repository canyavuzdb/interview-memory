export const COMPANY_SIZES = ['1-50', '50-200', '200-1000', '1000+']

export const APPLICATION_CHANNELS = [
  'linkedin',
  'kariyer_net',
  'referral',
  'company_site',
  'other',
]

export const PROCESS_STAGES = [
  'no_response',
  'auto_rejected',
  'hr_rejected',
  'hr_interview',
  'technical_interview',
  'final_interview',
  'offer_declined',
  'offer_accepted',
]

export const EXPERIENCE_RATINGS = [1, 2, 3, 4, 5]

export const INITIAL_COMPANY_EXPERIENCE_STATE = {
  step: 1,
  // Step 1 — Company & role
  companyName: '',
  companySector: '',
  companySize: '',
  appliedRole: '',
  applicationChannel: '',
  // Step 2 — Process & feedback
  lastStage: '',
  gotResponse: null,
  responseTimeDays: '',
  promisedResponseDays: '',
  gotRejectionReason: null,
  rejectionReasonQuality: '',
  overallExperience: '',
  wouldReapply: null,
  freeNote: '',
  // Meta
  submitStatus: 'idle',
  errors: {},
  dirty: false,
}
