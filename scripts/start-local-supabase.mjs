import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
const cliEntryPath = path.join(
  repositoryRoot,
  'node_modules',
  'supabase',
  'dist',
  'supabase.js',
)
const commandEnvironment = {
  ...process.env,
  SUPABASE_TELEMETRY_DISABLED: '1',
}
const databaseOnly = process.argv.includes('--database-only')

function runSupabase(arguments_) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliEntryPath, ...arguments_], {
      cwd: repositoryRoot,
      env: commandEnvironment,
      shell: false,
      stdio: 'inherit',
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(
        new Error(
          `Supabase ${arguments_.join(' ')} exited with code ${code}.`,
        ),
      )
    })
  })
}

if (databaseOnly) {
  await runSupabase(['db', 'start'])
  process.exit(0)
}

// A custom exposed schema must exist before PostgREST performs its first
// health-check. Starting the database alone applies pending migrations first;
// preserving that volume and then starting the complete stack keeps a fresh
// checkout reproducible without exposing `public` as a temporary workaround.
await runSupabase(['db', 'start'])
await runSupabase(['stop'])
await runSupabase(['start'])
