#!/usr/bin/env node
/* THE PERMISSIONS DRIFT CHECK (owner, D200 (3), 26 Sep 26 — "one place in the app answers 'may this person do
 * this?', mirroring the table, with a test that fails when the two disagree").
 *
 * The table IT will build the database's security roles from is docs/data-model.md §11. The app's copy of it is
 * src/state/permissions.json, which `may()` (src/state/auth.ts) answers from. This compares the two, cell by cell,
 * in BOTH directions: every row of §11 must be a row of the JSON with the same tables and the same letters, and
 * every JSON row must be a row of §11. Only the ops columns are compared; the "Own row is…" and Notes columns are
 * for the reader.
 *
 * WHERE IT RUNS, and why there (Fable F3, 26 Sep 26): a docs-only pull request skips every gate in deploy.yml
 * (`paths-ignore: '**.md'`), and a docs-only edit to §11 is exactly the change most likely to open a gap. So it runs
 * inside the document gate (scripts/docsize.mjs — the Docs guard on every PR and push, no install; and the Stop hook
 * at the end of every turn) AND in vitest (src/state/permissions.test.ts). Plain Node, no dependencies.
 *
 * Usage: node scripts/permcheck.mjs   (from raptor-port/ or the repo root) — exit 1 and the problems on a drift. */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const OPS = 'CRUD'
/* a cell is `—` (nothing) or letters from C R U D, space-separated, in that order */
function opsOf(cell, where) {
  const c = cell.trim()
  if (c === '—' || c === '-' || c === '') return { ops: '' }
  if (!/^[CRUD]( [CRUD])*$/.test(c)) return { err: `${where}: "${c}" is not a permission cell (use C R U D letters, or —)` }
  const ops = c.replace(/ /g, '')
  let last = -1
  for (const ch of ops) { const i = OPS.indexOf(ch); if (i <= last) return { err: `${where}: "${c}" — letters out of order or repeated` }; last = i }
  return { ops }
}
const tablesOf = (cell) => [...cell.matchAll(/`([A-Za-z]+)`/g)].map(m => m[1])
const cellsOf = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(s => s.trim())

/* §11's two tables, parsed. Returns { tables: [...], waiting: [...], errors: [...] } */
export function parseSection11(md) {
  const errors = []
  const a = md.indexOf('## 11. Security roles')
  if (a < 0) return { tables: [], waiting: [], errors: ['docs/data-model.md has no "## 11. Security roles" section'] }
  const rest = md.slice(a + 5)
  const b = rest.search(/\n## /)
  const sec = b < 0 ? rest : rest.slice(0, b)
  const lines = sec.split('\n')
  const out = { tables: [], waiting: [], errors }
  let mode = null
  for (const raw of lines) {
    const line = raw.replace(/\r$/, '')
    if (!line.trim().startsWith('|')) { mode = null; continue }
    const cells = cellsOf(line)
    if (cells[0] === 'Table' && cells[1] === 'Admin') {
      if (cells[2] !== 'Member' || cells[3] !== 'Member, own row') errors.push(`§11 main table header must be "Table | Admin | Member | Member, own row | …", got "${cells.join(' | ')}"`)
      mode = 'main'; continue
    }
    if (cells[0] === 'Table' && cells[1] === 'Waiting') {
      if (cells[2] !== 'Waiting, own row' || cells[4] !== 'Needs the guest switch') errors.push(`§11 waiting table header must be "Table | Waiting | Waiting, own row | Own row is… | Needs the guest switch | …", got "${cells.join(' | ')}"`)
      mode = 'wait'; continue
    }
    if (/^:?-+:?$/.test(cells[0])) continue            // the |---| separator
    if (!mode) continue
    const tables = tablesOf(cells[0])
    if (!tables.length) { errors.push(`§11: a row names no table in backticks: "${cells[0]}"`); continue }
    const where = `§11 ${tables.join(', ')}`
    if (mode === 'main') {
      const ad = opsOf(cells[1] || '', `${where} Admin`), me = opsOf(cells[2] || '', `${where} Member`), ow = opsOf(cells[3] || '', `${where} Member, own row`)
      for (const r of [ad, me, ow]) if (r.err) errors.push(r.err)
      out.tables.push({ tables, admin: ad.ops ?? '', member: me.ops ?? '', own: ow.ops ?? '' })
    } else {
      const an = opsOf(cells[1] || '', `${where} Waiting`), ow = opsOf(cells[2] || '', `${where} Waiting, own row`)
      for (const r of [an, ow]) if (r.err) errors.push(r.err)
      const g = (cells[4] || '').trim().toLowerCase()
      if (g !== 'yes' && g !== '—' && g !== '-' && g !== '') errors.push(`${where}: "Needs the guest switch" must be yes or —, got "${cells[4]}"`)
      out.waiting.push({ tables, any: an.ops ?? '', own: ow.ops ?? '', guestSwitch: g === 'yes' })
    }
  }
  if (!out.tables.length) errors.push('§11: the main permissions table was not found (header "| Table | Admin | Member | Member, own row | …")')
  if (!out.waiting.length) errors.push('§11: the Waiting table was not found (header "| Table | Waiting | Waiting, own row | …")')
  return out
}

const key = (r) => [...r.tables].sort().join(',')
function sideProblems(kind, doc, app, fields) {
  const probs = []
  const seen = new Map()
  for (const [label, rows] of [['§11', doc], ['permissions.json', app]]) {
    const names = new Map()
    for (const r of rows) for (const t of r.tables) {
      if (names.has(t)) probs.push(`${kind}: ${label} names ${t} in two rows`)
      names.set(t, true)
    }
    seen.set(label, new Map(rows.map(r => [key(r), r])))
  }
  const d = seen.get('§11'), a = seen.get('permissions.json')
  for (const [k, r] of d) {
    const x = a.get(k)
    if (!x) { probs.push(`${kind}: §11 row ${r.tables.join(', ')} is not a row of src/state/permissions.json`); continue }
    for (const f of fields) if (String(r[f]) !== String(x[f])) probs.push(`${kind}: ${r.tables.join(', ')} — ${f}: §11 says "${r[f]}", permissions.json says "${x[f]}"`)
  }
  for (const [k, x] of a) if (!d.has(k)) probs.push(`${kind}: permissions.json row ${x.tables.join(', ')} is not a row of docs/data-model.md §11`)
  return probs
}

/* every problem, as plain sentences; [] when the two agree */
export function comparePermissions(json, parsed) {
  const probs = [...parsed.errors]
  if (!json || !Array.isArray(json.tables) || !Array.isArray(json.waiting)) return [...probs, 'src/state/permissions.json must hold "tables" and "waiting" arrays']
  for (const r of [...json.tables, ...json.waiting]) for (const f of ['admin', 'member', 'own', 'any']) {
    if (r[f] == null) continue
    if (!/^C?R?U?D?$/.test(r[f])) probs.push(`permissions.json ${r.tables.join(', ')} ${f}: "${r[f]}" is not CRUD letters in order`)
  }
  probs.push(...sideProblems('main table', parsed.tables, json.tables, ['admin', 'member', 'own']))
  probs.push(...sideProblems('Waiting table', parsed.waiting, json.waiting, ['any', 'own', 'guestSwitch']))
  return probs
}

/* read both files from the app folder (raptor-port/) and compare */
export function checkPermissions(appRoot) {
  const md = join(appRoot, 'docs', 'data-model.md'), js = join(appRoot, 'src', 'state', 'permissions.json')
  if (!existsSync(md)) return [`${md} is missing`]
  if (!existsSync(js)) return [`${js} is missing`]
  let json
  try { json = JSON.parse(readFileSync(js, 'utf8')) } catch (e) { return [`src/state/permissions.json does not parse: ${e.message}`] }
  return comparePermissions(json, parseSection11(readFileSync(md, 'utf8')))
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  const probs = checkPermissions(appRoot)
  if (probs.length) {
    console.error(`permcheck: FAIL — docs/data-model.md §11 and src/state/permissions.json disagree (D200):`)
    for (const p of probs) console.error(`  - ${p}`)
    process.exit(1)
  }
  console.log('permcheck: OK — §11 and the app agree, cell for cell.')
}
