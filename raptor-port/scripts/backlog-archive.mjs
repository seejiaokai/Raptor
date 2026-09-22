#!/usr/bin/env node
/* THE ONE WAY A FINISHED ITEM LEAVES THE BACKLOG — [DOCS-GUARD] step 4, F5 (Fable, 22 Sep 26;
 * owner D30 and D76).
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
const id = (args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--homes') || '').replace(/^\[|\]$/g, '')
const hi = args.indexOf('--homes')
const homes = hi >= 0 && args[hi + 1] ? args[hi + 1].split(',').map(s => s.trim()).filter(Boolean) : []
const dry = args.includes('--dry-run')
if (!/^[A-Z][A-Z0-9-]+$/.test(id)) die('usage: backlog-archive.mjs <ITEM-ID> --homes <file>[,<file>...] [--dry-run]')

/* Split into lines KEEPING each line's own ending, so the slice we move is byte-exact. */
const withEnds = t => t.match(/[^\n]*\n|[^\n]+$/g) || []
const live = readFileSync(join(REPO, LIVE), 'utf8')
const arch = readFileSync(join(REPO, ARCHIVE), 'utf8')

/* Every item heading, fence-aware, as { id, start line, end line (exclusive) }. */
function items(text) {
  const ls = withEnds(text), heads = []
  let fence = false
  ls.forEach((l, i) => {
    const s = l.replace(/\r?\n$/, '')
    if (/^\s*```/.test(s)) { fence = !fence; return }
    if (!fence && /^#{1,3} /.test(s)) heads.push({ i, id: (/^### \[([A-Z][A-Z0-9-]+)\]/.exec(s) || [])[1] || null })
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
