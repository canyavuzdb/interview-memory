export const EXPERIENCE_BANDS = ['0-1', '1-3', '3-5', '5-8', '8+']

export const WORK_MODES = ['remote', 'hybrid', 'onsite']

export const ROLE_LEVELS = ['intern', 'junior', 'mid', 'senior', 'lead_manager']

export const TARGET_REGIONS = ['turkiye', 'europe', 'uk_ireland', 'mena', 'north_america', 'other']

export const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'freelance', 'internship']

export const SALARY_CURRENCIES = ['TRY', 'EUR', 'USD', 'GBP']

export const SEARCH_STATUSES = [
  'ongoing',
  'offer_accepted',
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

export const PRIMARY_CHANNELS = [
  'linkedin',
  'kariyer_net',
  'referral',
  'company_site',
  'other',
]

export const SEARCH_DURATIONS = [
  '1-2_weeks',
  '1_month',
  '2-3_months',
  '3-6_months',
  '6_plus_months',
]

export const SALARY_BANDS = [
  { id: 'b0_20', label: '0 - 20K' },
  { id: 'b20_30', label: '20K - 30K' },
  { id: 'b30_40', label: '30K - 40K' },
  { id: 'b40_50', label: '40K - 50K' },
  { id: 'b50_60', label: '50K - 60K' },
  { id: 'b60_80', label: '60K - 80K' },
  { id: 'b80_100', label: '80K - 100K' },
  { id: 'b100_plus', label: '100K+' },
]

export const INITIAL_APPLICATION_BENCHMARK_STATE = {
  step: 1,
  role: '',
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
  responsesCount: '',
  hrInterviewsCount: '',
  technicalInterviewsCount: '',
  offersCount: '',
  salaryCurrency: '',
  currentSalaryBand: '',
  expectedSalaryBand: '',
  highestOfferBand: '',
  hadReferral: null,
  sharedPortfolio: null,
  freeNote: '',
  submitStatus: 'idle',
  errors: {},
  dirty: false,
}
