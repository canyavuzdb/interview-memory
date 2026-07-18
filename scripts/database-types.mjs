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
const schemas = ['api', 'authorization', 'core', 'privacy']

function generateTypes() {
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
        stdio: ['ignore', 'pipe', 'inherit'],
      },
    )
    let output = ''

    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      output += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Supabase type generation exited with code ${code}.`))
        return
      }

      resolve(`${output.replaceAll('\r\n', '\n').trimEnd()}\n`)
    })
  })
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
