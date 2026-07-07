export async function submitCompanyExperience(payload) {
  // TODO: Replace with real Supabase insertion for company_experiences table
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mock submission successful:', payload)
      resolve({ success: true, id: 'preview-only' })
    }, 600)
  })
}
