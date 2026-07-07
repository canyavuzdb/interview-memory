export async function submitSalaryBenchmark(payload) {
  // TODO: Replace with real Supabase insertion for salary_benchmarks table
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mock submission successful:', payload)
      resolve({ success: true, id: 'preview-only' })
    }, 600)
  })
}
