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

export const EXPERIENCE_BANDS = ['0-1', '1-3', '3-5', '5-8', '8+']

export const CITIES = [
  'istanbul',
  'ankara',
  'izmir',
  'remote',
  'other',
]

export const SALARY_RANGES = [
  { id: 'r0_20', label: '0 - 20K' },
  { id: 'r20_30', label: '20K - 30K' },
  { id: 'r30_40', label: '30K - 40K' },
  { id: 'r40_55', label: '40K - 55K' },
  { id: 'r55_70', label: '55K - 70K' },
  { id: 'r70_90', label: '70K - 90K' },
  { id: 'r90_120', label: '90K - 120K' },
  { id: 'r120_plus', label: '120K+' },
]

export const BENEFITS = [
  'meal_card',
  'private_health',
  'remote_work',
  'flexible_hours',
  'stock_options',
  'education_budget',
  'none',
]

export const SALARY_DISCLOSURE_TYPES = [
  'yes_range',
  'yes_fixed',
  'no',
]

export const INITIAL_SALARY_BENCHMARK_STATE = {
  step: 1,
  // Step 1 — Role & context
  role: '',
  sector: '',
  experienceBand: '',
  city: '',
  // Step 2 — Salary data
  jobPostHadSalary: '',
  postedSalaryMin: '',
  postedSalaryMax: '',
  expectedSalary: '',
  offeredSalary: '',
  negotiated: null,
  afterNegotiation: '',
  benefitsOffered: [],
  salaryTransparency: '',
  feltFairOffer: null,
  // Meta
  submitStatus: 'idle',
  errors: {},
  dirty: false,
}
