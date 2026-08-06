#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises'

const [inputPath, outputPath] = process.argv.slice(2)

if (!inputPath || !outputPath) {
  throw new Error('Usage: node scripts/generate-kap-bist-company-seed.mjs <kap-html-path> <output-sql-path>')
}

const sourceUrl = 'https://kap.org.tr/tr/bist-sirketler'
const snapshotDate = new Date().toISOString().slice(0, 10)
const html = await readFile(inputPath, 'utf8')
const companyRow = /<tr class="border-b hover:bg-light-danger"><td[^>]*><a[^>]*><div>([^<]+)<\/div><\/a><\/td><td[^>]*><a[^>]*>([^<]+)<\/a>/g
const decodeHtml = (value) => value
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#x27;', "'")
  .replaceAll('&nbsp;', ' ')
  .trim()
const quoteSql = (value) => `'${value.replaceAll("'", "''")}'`

const seenTickers = new Set()
const companies = [...html.matchAll(companyRow)]
  .map(([, ticker, legalName]) => ({
    ticker: decodeHtml(ticker),
    legalName: decodeHtml(legalName),
  }))
  .filter(({ ticker }) => !seenTickers.has(ticker) && seenTickers.add(ticker))

if (companies.length < 650) {
  throw new Error(`KAP page parsing produced only ${companies.length} companies; source markup may have changed.`)
}

const values = companies
  .map(({ ticker, legalName }) => `  (${quoteSql(ticker)}, ${quoteSql(legalName)})`)
  .join(',\n')

const sql = `-- Generated from ${sourceUrl} on ${snapshotDate}.
-- Source: KAP's public BIST companies list. Do not edit individual rows;
-- regenerate from a fresh source snapshot when the list changes.

with source(ticker, legal_name) as (
values
${values}
), inserted as (
  insert into catalog.companies (
    slug,
    legal_name,
    display_name,
    country_code,
    verification_status,
    publication_status,
    external_case_ref,
    external_case_status,
    external_case_synced_at
  )
  select
    'kap-bist-' || lower(source.ticker),
    source.legal_name,
    source.legal_name,
    'TR',
    'verified',
    'published',
    'kap:bist:' || source.ticker,
    'listed',
    now()
  from source
  on conflict (slug) do update
    set legal_name = excluded.legal_name,
        display_name = excluded.display_name,
        verification_status = excluded.verification_status,
        publication_status = excluded.publication_status,
        external_case_status = excluded.external_case_status,
        external_case_synced_at = excluded.external_case_synced_at,
        updated_at = now(),
        version = catalog.companies.version + 1
  returning id, slug, display_name
), inserted_aliases as (
  insert into catalog.company_aliases (
  company_id,
  normalized_alias,
  locale,
  country_code,
    source_code
  )
  select
  inserted.id,
  catalog.normalize_company_alias_v1(inserted.display_name),
  'tr',
  'TR',
    'import'
  from inserted
  where not exists (
    select 1
    from catalog.company_aliases as existing_alias
    where existing_alias.normalized_alias = catalog.normalize_company_alias_v1(inserted.display_name)
      and existing_alias.locale = 'tr'
      and existing_alias.country_code = 'TR'
      and existing_alias.review_status = 'approved'
  )
  on conflict do nothing
  returning id
)
update catalog.company_aliases as alias
set review_status = 'approved'
from inserted_aliases
where alias.id = inserted_aliases.id;

-- Ticker aliases let candidates find a listed company by its BIST code too.
with source(ticker) as (
values
${companies.map(({ ticker }) => `  (${quoteSql(ticker)})`).join(',\n')}
), inserted_aliases as (
  insert into catalog.company_aliases (
  company_id,
  normalized_alias,
  locale,
  country_code,
    source_code
  )
  select
  company.id,
  catalog.normalize_company_alias_v1(source.ticker),
  'tr',
  'TR',
    'import'
  from source
  join catalog.companies as company
    on company.slug = 'kap-bist-' || lower(source.ticker)
  where not exists (
    select 1
    from catalog.company_aliases as existing_alias
    where existing_alias.normalized_alias = catalog.normalize_company_alias_v1(source.ticker)
      and existing_alias.locale = 'tr'
      and existing_alias.country_code = 'TR'
      and existing_alias.review_status = 'approved'
  )
  on conflict do nothing
  returning id
)
update catalog.company_aliases as alias
set review_status = 'approved'
from inserted_aliases
where alias.id = inserted_aliases.id;
`

await writeFile(outputPath, sql)
console.log(`Generated ${companies.length} KAP BIST company rows: ${outputPath}`)
