#!/usr/bin/env node
/* THE ONE WAY A FINISHED ITEM LEAVES THE BACKLOG — [DOCS-GUARD] step 4, F5 (Fable, 22 Sep 26;
 * owner D30 and D83).
 *
 *   node raptor-port/scripts/backlog-archive.mjs <ITEM-ID> --homes <file>[,<file>...] [--dry-run]
 *
 * On 22 Sep 26 an unbounded span-replace, written on the spot to move finished items, destroyed two
 * filed items — one a ruling's only home. The archive says "never append by hand", which for a live
 * destination means "use a script", and none was committed. This is that script, and it refuses to
 * do anything it cannot do exactly:
 *   - the id must head exactly ONE item in OUTSTANDING.md and none in the archive (a mover keyed by
 *     a duplicate id moves whichever it finds first — Fable found that live for two ids);
 *   - the item runs from its heading to the next heading at EITHER level (`## Done` sits between
 *     items, and "up to the next `### [`" would swallow it), ignoring `#` lines inside code blocks;
 *   - --homes is REQUIRED: the files where the item's still-useful facts now live. Each must exist
 *     and either mention the id or be changed on this branch — "write the pointer, THEN move"
 *     (OUTSTANDING.md §Maintaining, F4). A move with nowhere named is how a fact loses its only home;
 *   - the bytes move unchanged: line endings are never normalised, nothing is reflowed;
 *   - afterwards it runs the document gate's inventory, and if that is not clean it puts BOTH files
 *     back exactly as they were;
 *   - it prints every remaining mention of the id, because pointers to a moved item need a hand
 *     look — a script cannot know which of them should now say "archived". */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const LIVE = 'OUTSTANDING.md', ARCHIVE = 'OUTSTANDING-ARCHIVE.md'
const GATE = join(REPO, 'raptor-port', 'scripts', 'docsize.mjs')

const die = msg => { console.error(`backlog-archive: ${msg}`); process.exit(1) }
const git = (...a) => { try { return execFileSync('git', a, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) } catch { return '' } }

const args = process.argv.slice(2)

/* --rulings — THE ONE WAY A RULING LEAVES THE LIVE LIST (owner, D136 + D137, 24 Sep 26), and the way the
   map in DECISIONS.md is kept true. A ruling that a later one wholly REPLACES, or a one-off permission once
   SPENT, is marked at the head of its ruling cell (DECISIONS.md, step 2); this moves every marked row out
   of its area file under .claude/rules/decisions/ to the foot of DECISIONS-ARCHIVE.md, under the heading
   of the day it moved, byte for byte — then rewrites the map's last column from what each file now holds
   (a NEW ruling therefore reaches the map the same way). Like the item mover it runs the gate's inventory
   afterwards and puts EVERY file back if that is not clean. */
if (args.includes('--rulings')) {
  const DIR = '.claude/rules/decisions', DEC = 'DECISIONS.md', ARCHR = 'DECISIONS-ARCHIVE.md'
  const MARKED = /^\*\*(?:(?:REPLACED|REVERSED|SUPERSEDED|ENDED) BY D\d+|SPENT\b)/
  const rowId = l => (/^\|\s*(D\d+)\s*\|/.exec(l) || [])[1] // loose, like the gate's ROW_ID
  /* this block runs before the item mover's own helpers are defined below, so it carries its own */
  const lineEnds = t => t.match(/[^\n]*\n|[^\n]+$/g) || []
  const dryRun = args.includes('--dry-run')
  const areas = [...new Set([...git('ls-files', '--', DIR).split('\n'), ...git('ls-files', '--others', '--exclude-standard', '--', DIR).split('\n')])]
    .filter(f => f.endsWith('.md') && existsSync(join(REPO, f))).sort()
  const files = [...areas, ARCHR, DEC].filter(f => existsSync(join(REPO, f)))
  const before = new Map(files.map(f => [f, readFileSync(join(REPO, f), 'utf8')]))
  const after = new Map(before)
  const moved = []
  for (const f of areas) {
    const keep = []
    let fence = null
    for (const l of lineEnds(after.get(f))) {
      const s = l.replace(/\r?\n$/, '')
      /* a row inside a code block is an example, never a ruling to move (Astra, 24 Sep 26) */
      const was = fence
      fence = fenceStep(fence, s)
      if (!was && !fence && rowId(s) && MARKED.test(s.split('|').map(x => x.trim())[3] || '')) moved.push({ d: rowId(s), from: f, line: l.endsWith('\n') ? l : l + '\n' })
      else keep.push(l)
    }
    after.set(f, keep.join(''))
  }
  if (moved.length) {
    if (!after.has(ARCHR)) die(`${ARCHR} does not exist — it must, before a ruling can move there.`)
    let a = after.get(ARCHR)
    const eolA = a.includes('\r\n') ? '\r\n' : '\n'
    const now = new Date(), day = `${now.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()]} ${String(now.getFullYear()).slice(2)}`
    const heads = [...a.matchAll(/^## Moved (.+?)\r?$/gm)]
    if (!a.endsWith('\n')) a += eolA
    if (!heads.length || heads[heads.length - 1][1] !== day) a += `${eolA}## Moved ${day}${eolA}${eolA}| # | Date | His ruling, in his words where short enough | What it means | Where it lives now |${eolA}|---|---|---|---|---|${eolA}`
    after.set(ARCHR, a + moved.map(m => m.line).join(''))
  }
  /* the map: each row's last column = the D-numbers its file now holds, in the file's own order */
  const outsideFences = ls => { let fence = null; return ls.map(l => { const was = fence; fence = fenceStep(fence, l.replace(/\r?\n$/, '')); return !was && !fence }) }
  const idsOf = f => { const ls = lineEnds(after.get(f) || ''), out = outsideFences(ls); return ls.map((l, i) => out[i] && rowId(l)).filter(Boolean) }
  const MAP_ROW = /^(\| [^|]+? \| `([^`]+)` \| [^|]*? \| )([^|]*?)( \|\s*)$/
  let mapChanged = 0
  const decLines = lineEnds(after.get(DEC)), decOut = outsideFences(decLines)
  after.set(DEC, decLines.map((l, i) => {
    const eolL = l.match(/\r?\n$/)?.[0] || ''
    const m = decOut[i] && MAP_ROW.exec(l.replace(/\r?\n$/, ''))
    if (!m ||!(m[2] === ARCHR || m[2].startsWith(DIR + '/')) || !after.has(m[2])) return l
    const list = idsOf(m[2]).join(', ') || '—'
    if (list === m[3]) return l
    mapChanged++
    return m[1] + list + m[4] + eolL
  }).join(''))
  const unmapped = [...areas, ARCHR].filter(f => after.has(f) && !lineEnds(after.get(DEC)).some(l => l.includes('`' + f + '`')))
  console.log(moved.length ? moved.map(m => `${m.d}: ${m.from} → ${ARCHR}`).join('\n') : 'No marked ruling to move.')
  console.log(mapChanged ? `The map in ${DEC}: ${mapChanged} row(s) rewritten from the files.` : `The map in ${DEC} already matches the files.`)
  if (unmapped.length) console.log(`NOT in the map — add a row for each by hand (area, file, when it loads), then run this again: ${unmapped.join(', ')}`)
  if (dryRun) { console.log('--dry-run: nothing written.'); process.exit(0) }
  for (const [f, t] of after) if (t !== before.get(f)) writeFileSync(join(REPO, f), t)
  const r = spawnSync(process.execPath, [GATE, '--inventory'], { cwd: REPO, encoding: 'utf8' })
  if (r.status !== 0) {
    for (const [f, t] of before) writeFileSync(join(REPO, f), t)
    console.error(r.stdout + r.stderr)
    die('the inventory was not clean afterwards, so EVERY file was put back exactly as it was.')
  }
  console.log('done; the inventory is clean.')
  process.exit(0)
}

const id =(args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--homes') || '').replace(/^\[|\]$/g, '')
const hi = args.indexOf('--homes')
/* Homes as git paths from the repo root, `/`-separated, so a Windows `docs\facts.md` matches what
   git reports (Astra); an absolute path or one climbing out of the repo is refused below. */
const homes = hi >= 0 && args[hi + 1] ? args[hi + 1].split(',').map(s => s.trim().replace(/\\/g, '/').replace(/^(\.\/)+/, '')).filter(Boolean) : []
const dry = args.includes('--dry-run')
if (!/^[A-Z][A-Z0-9-]+$/.test(id)) die('usage: backlog-archive.mjs <ITEM-ID> --homes <file>[,<file>...] [--dry-run]')

/* Split into lines KEEPING each line's own ending, so the slice we move is byte-exact. */
const withEnds = t => t.match(/[^\n]*\n|[^\n]+$/g) || []
const live = readFileSync(join(REPO, LIVE), 'utf8')
const arch = readFileSync(join(REPO, ARCHIVE), 'utf8')

/* The same code-block rule as docsize.mjs's fenceStep — keep the two identical: opens on 3+
   backticks or tildes, closes only on the SAME character, at least as long, with nothing after. */
function fenceStep(fence, line) {
  const f = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line)
  if (!f) return fence
  if (fence) return f[1][0] === fence.ch && f[1].length >= fence.len && !f[2].trim() ? null : fence
  return { ch: f[1][0], len: f[1].length }
}

/* Every item heading, fence-aware, as { id, start line, end line (exclusive) }. */
function items(text) {
  const ls = withEnds(text), heads = []
  let fence = null
  ls.forEach((l, i) => {
    const s = l.replace(/\r?\n$/, '')
    const was = fence
    fence = fenceStep(fence, s)
    if (!was && !fence && /^#{1,3} /.test(s)) heads.push({ i, id: (/^### \[([A-Z][A-Z0-9-]+)\]/.exec(s) || [])[1] || null })
  })
  return { ls, list: heads.map((h, k) => ({ id: h.id, from: h.i, to: k + 1 < heads.length ? heads[k + 1].i : ls.length })).filter(h => h.id) }
}

const L = items(live), A = items(arch)
const hits = L.list.filter(h => h.id === id)
if (hits.length === 0) die(`[${id}] heads no item in ${LIVE}.`)
if (hits.length > 1) die(`[${id}] heads ${hits.length} items in ${LIVE} — give each its own id first; moving "the first one" is how the wrong item moves.`)
if (A.list.some(h => h.id === id)) die(`[${id}] already heads an item in ${ARCHIVE} — rename one of them first, or the two become one id.`)

if (!homes.length) die(`--homes is required: name the file(s) where [${id}]'s still-useful facts now live. Write the pointer, THEN move (OUTSTANDING.md §Maintaining).`)
const base = (git('merge-base', 'HEAD', 'origin/main') || git('merge-base', 'HEAD', 'main') || 'HEAD').trim()
const changed = new Set([...git('diff', '--name-only', base).split('\n'), ...git('ls-files', '--others', '--exclude-standard').split('\n')].filter(Boolean))
for (const h of homes) {
  if (/^([A-Za-z]:|\/)/.test(h) || h.split('/').includes('..')) die(`--homes ${h}: give a path from the repo root, inside the repo.`)
  if (!existsSync(join(REPO, h))) die(`--homes ${h}: no such file (paths are from the repo root).`)
  if (h === LIVE || h === ARCHIVE) die(`--homes ${h}: the backlog cannot be the home of what leaves it.`)
  const mentions = readFileSync(join(REPO, h), 'utf8').includes(id)
  if (!mentions && !changed.has(h)) die(`--homes ${h}: it neither mentions ${id} nor was changed on this branch, so nothing shows the facts were written there.`)
}

const { from, to } = hits[0]
const block = L.ls.slice(from, to).join('')
const eol = live.includes('\r\n') ? '\r\n' : '\n'
const newLive = L.ls.slice(0, from).join('') + L.ls.slice(to).join('')
/* the LOCAL date — toISOString is UTC, which read a day early on its first real run (UTC+8) */
const now = new Date(), date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
const note = `*Moved here ${date} by backlog-archive.mjs. Forward facts: ${homes.map(h => '`' + h + '`').join(', ')}.*${eol}${eol}`
const newArch = arch + (arch.endsWith('\n') ? '' : eol) + eol + note + block + (block.endsWith('\n') ? '' : eol)

console.log(`[${id}]: ${to - from} lines, ${LIVE} line ${from + 1} → end of ${ARCHIVE}`)
if (dry) { console.log('--dry-run: nothing written.'); process.exit(0) }

writeFileSync(join(REPO, LIVE), newLive)
writeFileSync(join(REPO, ARCHIVE), newArch)
const r = spawnSync(process.execPath, [GATE, '--inventory'], { cwd: REPO, encoding: 'utf8' })
if (r.status !== 0) {
  writeFileSync(join(REPO, LIVE), live)
  writeFileSync(join(REPO, ARCHIVE), arch)
  console.error(r.stdout + r.stderr)
  die('the inventory was not clean after the move, so BOTH files were put back exactly as they were.')
}
console.log('moved; the inventory is clean.')

const refs = git('grep', '-n', '-F', `[${id}]`, '--', '*.md').split('\n').filter(l => l && !l.startsWith(`${ARCHIVE}:`))
if (refs.length) {
  console.log(`\n${refs.length} other mention(s) of [${id}] — check each still reads true now it is archived:`)
  for (const l of refs) console.log('  ' + (l.length > 150 ? l.slice(0, 147) + '...' : l))
}
