import { readFile, rename, unlink, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const mode = process.argv[2]

if (!['check', 'generate'].includes(mode)) {
  console.error('Usage: node scripts/database-types.mjs <check|generate>')
  process.exit(2)
}

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
const outputPath = path.join(
  repositoryRoot,
  'lib',
  'database',
  'database.generated.ts',
)
const cliEntryPath = path.join(
  repositoryRoot,
  'node_modules',
  'supabase',
  'dist',
  'supabase.js',
)
const schemas = [
  'api',
  'authorization',
  'catalog',
  'core',
  'moderation',
  'privacy',
]
const registryRetryDelaysMs = [5_000, 10_000, 20_000, 40_000]
const transientRegistryErrorPattern =
  /(?:toomanyrequests|too many requests|rate exceeded|pull rate limit|request rate limit|status(?: code)?\s*:?\s*429|429[^\n]*too many requests)/iu

class TypeGenerationError extends Error {
  constructor(code, diagnosticOutput) {
    super(`Supabase type generation exited with code ${code}.`)
    this.name = 'TypeGenerationError'
    this.diagnosticOutput = diagnosticOutput
  }
}

function generateTypesAttempt() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        cliEntryPath,
        'gen',
        'types',
        'typescript',
        '--local',
        '--schema',
        schemas.join(','),
      ],
      {
        cwd: repositoryRoot,
        env: {
          ...process.env,
          SUPABASE_TELEMETRY_DISABLED: '1',
        },
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    )
    let output = ''
    let diagnosticOutput = ''

    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      output += chunk
    })
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', (chunk) => {
      diagnosticOutput += chunk
      process.stderr.write(chunk)
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(
          new TypeGenerationError(
            code,
            `${diagnosticOutput}\n${output}`,
          ),
        )
        return
      }

      resolve(`${output.replaceAll('\r\n', '\n').trimEnd()}\n`)
    })
  })
}

async function generateTypes() {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await generateTypesAttempt()
    } catch (error) {
      const retryDelayMs = registryRetryDelaysMs[attempt]
      const isRetryable =
        error instanceof TypeGenerationError &&
        transientRegistryErrorPattern.test(error.diagnosticOutput)

      if (!isRetryable || retryDelayMs === undefined) {
        throw error
      }

      console.error(
        `Container registry rate limit detected. Retrying type generation in ${retryDelayMs / 1_000}s (attempt ${attempt + 2}/${registryRetryDelaysMs.length + 1}).`,
      )
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
    }
  }
}

const generatedTypes = await generateTypes()

if (mode === 'check') {
  let committedTypes

  try {
    committedTypes = await readFile(outputPath, 'utf8')
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      console.error('Generated database types are missing. Run npm run db:types.')
      process.exit(1)
    }

    throw error
  }

  if (committedTypes.replaceAll('\r\n', '\n') !== generatedTypes) {
    console.error(
      'Generated database types are stale. Run npm run db:types and commit the result.',
    )
    process.exit(1)
  }

  console.log('Generated database types are current.')
} else {
  await mkdir(path.dirname(outputPath), { recursive: true })

  const temporaryPath = `${outputPath}.tmp-${process.pid}`

  try {
    await writeFile(temporaryPath, generatedTypes, {
      encoding: 'utf8',
      flag: 'wx',
    })
    await rename(temporaryPath, outputPath)
  } catch (error) {
    await unlink(temporaryPath).catch(() => {})
    throw error
  }

  console.log(
    `Generated ${path.relative(repositoryRoot, outputPath)} from the local database.`,
  )
}
