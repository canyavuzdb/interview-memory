export const EXPERIENCE_BANDS = ['0-1', '1-3', '3-5', '5-8', '8+']

export const WORK_MODES = ['remote', 'hybrid', 'onsite']

export const ROLE_LEVELS = ['intern', 'junior', 'mid', 'senior', 'lead_manager']

export const TARGET_REGIONS = ['turkiye', 'europe', 'uk_ireland', 'mena', 'north_america', 'other']

export const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'freelance', 'internship']

export const SEARCH_STATUSES = [
  'ongoing',
  'offer_accepted',
  'employment_started',
  'offer_rejected',
  'abandoned',
]

export const SECTORS = [
  'technology',
  'finance',
  'ecommerce',
  'consulting',
  'healthcare',
  'manufacturing',
  'education',
  'media',
  'telecom',
  'other',
]

export const INITIAL_APPLICATION_BENCHMARK_STATE = {
  step: 1,
  role: '',
  roleLabel: '',
  sector: '',
  roleLevel: '',
  experienceBand: '',
  targetRegion: '',
  employmentType: '',
  workMode: '',
  isCurrentlyEmployed: null,
  searchStartedAt: '',
  searchStatus: '',
  searchEndedAt: '',
  applicationsCount: '',
  humanResponsesCount: '',
  anyInterviewsCount: '',
  hrInterviewsCount: '',
  technicalInterviewsCount: '',
  offersCount: '',
  acceptedOffersCount: '',
  employmentStartedCount: '',
  countsAreEstimated: null,
  consentGranted: false,
  receiptId: null,
  searchEpisodeId: null,
  submissionCapability: null,
  comparison: null,
  replayed: false,
  submitStatus: 'idle',
  errors: {},
  dirty: false,
}
