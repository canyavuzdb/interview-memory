import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
const databaseTestsRoot = path.join(
  repositoryRoot,
  'supabase',
  'tests',
  'database',
)

async function findDatabaseTests(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const tests = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      tests.push(...(await findDatabaseTests(entryPath)))
      continue
    }

    if (entry.isFile() && /\.(?:sql|pg)$/u.test(entry.name)) {
      tests.push(entryPath)
    }
  }

  return tests
}

let databaseTests

try {
  databaseTests = await findDatabaseTests(databaseTestsRoot)
} catch (error) {
  if (error && typeof error === 'object' && error.code === 'ENOENT') {
    databaseTests = []
  } else {
    throw error
  }
}

if (databaseTests.length === 0) {
  console.error('No pgTAP database tests were found.')
  process.exitCode = 1
} else {
  console.log(`Found ${databaseTests.length} pgTAP database test files.`)
}
