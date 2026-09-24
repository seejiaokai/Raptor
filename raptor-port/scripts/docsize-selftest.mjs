#!/usr/bin/env node
/* PROOF THAT THE DOCUMENT GATE STILL CATCHES WHAT IT EXISTS TO CATCH — [DOCS-GUARD], 23 Sep 26.
 *
 * A guard nobody has seen go red is a guard nobody knows works. This builds a throwaway git repo
 * in the temp folder, copies docsize.mjs into it, and replays the 22 Sep 26 destruction and its
 * cousins against a small backlog: an item deleted, bodies doubled, an item moved to the archive
 * but truncated, an archive line removed, a new duplicate id — each must FAIL, by name. Then the
 * legitimate moves (a clean archive move, a declared exception) must PASS, and the ceiling rules
 * of F3 must hold: over a ceiling on a docs-only change fails, over a ceiling inside a code change
 * is deferred, and a ceiling moved in a commit that touches src fails.
 *
 * Run: node scripts/docsize-selftest.mjs (CI runs it beside the gate itself). Exit 1 on any miss. */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'

const HERE = dirname(fileURLToPath(import.meta.url))
const GATE = join(HERE, 'docsize.mjs')
const MOVER = join(HERE, 'backlog-archive.mjs')

const item = (id, n) => [`### [${id}] The ${id} item — OPEN`, '', ...Array.from({ length: n }, (_, i) => `Line ${i + 1} of ${id}, long enough to count as a real body line for the doubling check.`), ''].join('\n')
const LIVE0 = ['# Outstanding', '', '## Items', '', item('ALPHA', 6), item('BRAVO', 6), item('CHARLIE', 6), '## Done', '', item('DELTA', 3)].join('\n')
const ARCH0 = ['# Archive', '', item('OLD', 3)].join('\n')
const RULES0 = "const RULES = {\n  X1: 'first rule',\n  X2: 'second rule',\n}\n"
const REG0 = ['# Register', '', '- **X1** — the first rule.', '', '| X2 | the second rule |', ''].join('\n')
/* The rulings in the D137 shape: rows live in an AREA file, DECISIONS.md holds only the map, and the
   archive holds one row already marked as replaced. */
const AREA = '.claude/rules/decisions/general.md'
const AREA0 = ['# Rulings — general', '', '| # | Date | ruling | meaning | home |', '|---|---|---|---|---|', '| D2 | 21 Sep 26 | b | b | `OUTSTANDING.md` |', '| D1 | 21 Sep 26 | a | a | `OUTSTANDING.md` |', ''].join('\n')
const DARCH0 = ['# Archive', '', '## Moved 21 Sep 26', '', '| # | Date | ruling | meaning | home |', '|---|---|---|---|---|', '| D0 | 20 Sep 26 | **REPLACED BY D1 (21 Sep 26).** z | z | `OUTSTANDING.md` |', ''].join('\n')
const mapRow = (area, file, ids) => '| ' + area + ' | ' + '`' + file + '`' + ' | always | ' + ids + ' |'
const DEC0 = ['# DECISIONS', '', '| Area | File | Loads by itself | Rulings |', '|---|---|---|---|', mapRow('General', AREA, 'D2, D1'), mapRow('Archive', 'DECISIONS-ARCHIVE.md', 'D0'), ''].join('\n')
/* point one map row at a new list of D-numbers */
const setMap = (c, file, ids) => c.edit('DECISIONS.md', t => t.split('\n').map(l => l.includes('`' + file + '`') ? l.replace(/\| [^|]*\|$/, '| ' + ids + ' |') : l).join('\n'))

let failed = 0
/* A throwaway repo holding a tiny backlog, archive, rulings list, rule map and register. */
function makeRepo(live = LIVE0) {
  const dir = mkdtempSync(join(tmpdir(), 'docsguard-'))
  const g = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const w = (f, t) => { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), t) }
  g('init', '-q', '-b', 'main')
  g('config', 'user.email', 'selftest@example.invalid'); g('config', 'user.name', 'selftest'); g('config', 'core.autocrlf', 'false')
  w('raptor-port/scripts/docsize.mjs', readFileSync(GATE, 'utf8'))
  w('raptor-port/scripts/backlog-archive.mjs', readFileSync(MOVER, 'utf8'))
  w('raptor-port/scripts/rulecheck.mjs', RULES0)
  w('raptor-port/docs/superpowers/specs/x-behaviour-register.md', REG0)
  w('OUTSTANDING.md', live); w('OUTSTANDING-ARCHIVE.md', ARCH0); w('DECISIONS.md', DEC0); w(AREA, AREA0); w('DECISIONS-ARCHIVE.md', DARCH0)
  w('raptor-port/src/app.ts', 'export const a = 1\n')
  w('docs/home.md', 'Where the facts of CHARLIE now live.\n')
  g('add', '-A'); g('commit', '-q', '-m', 'base')
  const base = g('rev-parse', 'HEAD').trim()
  return {
    dir, base,
    read: f => readFileSync(join(dir, f), 'utf8'), write: w,
    commit: (msg) => { g('add', '-A'); g('commit', '-q', '-m', msg) },
    edit: (f, fn) => w(f, fn(readFileSync(join(dir, f), 'utf8'))),
  }
}

function scenario(name, expectFail, mutate, { mustSay, base: baseOverride } = {}) {
  const ctx = makeRepo(), dir = ctx.dir, base = ctx.base
  try {
    mutate(ctx)
    const r = spawnSync(process.execPath, ['raptor-port/scripts/docsize.mjs'], { cwd: dir, encoding: 'utf8', env: { ...process.env, DOCSGUARD_BASE: baseOverride ?? base, DOCSGUARD_ALLOW: '' } })
    const out = r.stdout + r.stderr
    const didFail = r.status !== 0
    const said = !mustSay || out.includes(mustSay)
    const ok = didFail === expectFail && said
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'MISS'}  ${name} — expected ${expectFail ? 'FAIL' : 'OK'}, got ${didFail ? 'FAIL' : 'OK'}${said ? '' : ` (output lacks "${mustSay}")`}`)
    if (!ok) console.log(out.split('\n').map(l => '      ' + l).join('\n'))
  } finally { rmSync(dir, { recursive: true, force: true }) }
}

const cut = (t, id) => { const s = t.indexOf(`### [${id}]`); const e = t.indexOf('\n#', s + 1); return [t.slice(0, s) + (e < 0 ? '' : t.slice(e + 1)), t.slice(s, e < 0 ? undefined : e + 1)] }

scenario('unchanged backlog', false, () => {})
scenario('an item deleted outright', true, c => c.edit('OUTSTANDING.md', t => cut(t, 'BRAVO')[0]), { mustSay: '[BRAVO] is GONE' })
scenario('an item deleted and committed (the branch is still measured from its base)', true, c => { c.edit('OUTSTANDING.md', t => cut(t, 'BRAVO')[0]); c.commit('trim') }, { mustSay: '[BRAVO] is GONE' })
scenario('every body doubled, headings untouched (22 Sep passes 1 and 2)', true, c => c.edit('OUTSTANDING.md', t => t.replace(/^(Line .*)$/gm, '$1\n$1')), { mustSay: 'doubled body' })
scenario('a clean move to the archive', false, c => { const [rest, blk] = cut(c.read('OUTSTANDING.md'), 'CHARLIE'); c.write('OUTSTANDING.md', rest); c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n' + blk) })
scenario('a move to the archive that truncated the item', true, c => { const [rest, blk] = cut(c.read('OUTSTANDING.md'), 'CHARLIE'); c.write('OUTSTANDING.md', rest); c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n' + blk.split('\n').slice(0, 4).join('\n')) }, { mustSay: 'truncated on the way' })
scenario('an item closed with a status edit, committed, then moved', false, c => { c.edit('OUTSTANDING.md', t => t.replace('### [CHARLIE] The CHARLIE item — OPEN', '### [CHARLIE] The CHARLIE item — DONE').replace('Line 6 of CHARLIE', 'Closed: line 6 of CHARLIE')); c.commit('close CHARLIE'); const [rest, blk] = cut(c.read('OUTSTANDING.md'), 'CHARLIE'); c.write('OUTSTANDING.md', rest); c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n' + blk) })
scenario('an item truncated and moved in one COMMITTED step', true, c => { const [rest, blk] = cut(c.read('OUTSTANDING.md'), 'CHARLIE'); c.write('OUTSTANDING.md', rest); c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n' + blk.split('\n').slice(0, 4).join('\n')); c.commit('move') }, { mustSay: 'truncated on the way' })
scenario('a line removed from the append-only archive', true, c => c.edit('OUTSTANDING-ARCHIVE.md', t => t.replace(/^Line 2 of OLD.*\n/m, '')), { mustSay: 'append-only' })
scenario('a new duplicate id', true, c => c.edit('OUTSTANDING.md', t => t + '\n' + item('ALPHA', 1).replace('Line 1 of ALPHA', 'A different body for ALPHA')), { mustSay: '[ALPHA] now appears 2 times' })
scenario('an id renamed without saying so (the item under "## Done" is still read)', true, c => c.edit('OUTSTANDING.md', t => t.replace(/^Line 2 of DELTA.*\n/m, '').replace('### [DELTA]', '### [DELTA-X]')), { mustSay: '[DELTA] is GONE' })
scenario('a deliberate removal declared in the commit', false, c => { c.edit('OUTSTANDING.md', t => cut(t, 'BRAVO')[0]); c.commit('drop BRAVO\n\nDocs-guard-allow: [BRAVO]') })
const renameLive = c => c.edit('OUTSTANDING.md', t => t.replace('### [BRAVO]', '### [BRAVO-CLOSED]'))
scenario('a live id renamed while its old id survives elsewhere — undeclared', true, c => { c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n' + item('BRAVO', 1).replace('Line 1 of BRAVO', 'The archived record of BRAVO')); c.commit('archive a BRAVO record'); renameLive(c) }, { mustSay: 'truncated on the way' })
scenario('the same rename, declared in the commit', false, c => { c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n' + item('BRAVO', 1).replace('Line 1 of BRAVO', 'The archived record of BRAVO')); c.commit('archive a BRAVO record'); renameLive(c); c.commit('rename\n\nDocs-guard-allow: [BRAVO]') })
scenario('over a ceiling on a docs-only change', true, c => c.edit('DECISIONS.md', t => t + 'x\n'.repeat(200)), { mustSay: 'over its ceiling' })
scenario('over a ceiling inside a code change is deferred, not failed', false, c => { c.edit('DECISIONS.md', t => t + 'x\n'.repeat(200)); c.edit('raptor-port/src/app.ts', t => t + 'export const b = 2\n') }, { mustSay: 'deferred (D29)' })
/* the row's shape since D141 (24 Sep 26): file, tier, ceiling — the edit must really change the ceiling, or
   these two scenarios would pass for the wrong reason (the "nothing changed" check below guards it) */
const raiseDecisions = t => { const u = t.replace(/(\['DECISIONS\.md',\s+1,\s+)\d+\]/, '$1400]'); if (u === t) throw new Error('the DECISIONS.md ceiling row was not found — update this self-test'); return u }
scenario('a ceiling moved in a commit that also touches src', true, c => { c.edit('raptor-port/scripts/docsize.mjs', raiseDecisions); c.edit('raptor-port/src/app.ts', t => t + 'export const b = 2\n'); c.commit('sneak') }, { mustSay: 'touches raptor-port/src' })
scenario('a ceiling moved in a docs-only commit', false, c => { c.edit('raptor-port/scripts/docsize.mjs', raiseDecisions); c.commit('raise, with its reason') })

scenario('a ruling number lost from its area file (F7)', true, c => c.edit(AREA, t => t.replace(/^\| D1 \|.*\n/m, '')), { mustSay: 'D1 is GONE' })
scenario('a ruling number newly used twice (F7)', true, c => c.edit(AREA, t => t.replace('| D2 | 21 Sep 26 | b |', '| D1 | 21 Sep 26 | b |')), { mustSay: 'D1 now appears 2 times' })
scenario('a ruling number skipped — a parallel branch holds the range', false, c => { c.edit(AREA, t => t.replace('|---|---|---|---|---|\n', '|---|---|---|---|---|\n| D9 | 21 Sep 26 | z | z | this file |\n')); setMap(c, AREA, 'D9, D2, D1') })

/* THE STRUCTURE KEEPS ITSELF (D137) — a ruling in the map file, a map out of step, a marked row left live,
   a row copied to two areas: each FAILS by name; a clean move between areas passes. */
const OTHER = '.claude/rules/decisions/other.md'
const addOther = (c, ids) => c.edit('DECISIONS.md', t => t.replace('| Archive |', mapRow('Other', OTHER, ids) + '\n| Archive |'))
scenario('the rulings in the D137 shape, unchanged', false, () => {})
scenario('a ruling written in DECISIONS.md instead of its area', true, c => c.edit('DECISIONS.md', t => t + '\n| D9 | 21 Sep 26 | z | z | this file |\n'), { mustSay: 'is written in DECISIONS.md' })
scenario('a new ruling the map does not list', true, c => c.edit(AREA, t => t.replace('|---|---|---|---|---|\n', '|---|---|---|---|---|\n| D9 | 21 Sep 26 | z | z | this file |\n')), { mustSay: 'does not match the files' })
scenario('the map listing a ruling its file does not hold', true, c => setMap(c, AREA, 'D2, D1, D7'), { mustSay: 'does not match the files' })
scenario('a replaced ruling left in its area file', true, c => c.edit(AREA, t => t.replace('| D1 | 21 Sep 26 | a |', '| D1 | 21 Sep 26 | **REPLACED BY D2 (21 Sep 26).** a |')), { mustSay: 'backlog-archive.mjs --rulings' })
scenario('a spent permission left in its area file', true, c => c.edit(AREA, t => t.replace('| D1 | 21 Sep 26 | a |', '| D1 | 21 Sep 26 | **SPENT 21 Sep 26 — merged.** a |')), { mustSay: 'marked replaced/spent' })
scenario('an archived row without its mark', true, c => c.edit('DECISIONS-ARCHIVE.md', t => t.replace('**REPLACED BY D1 (21 Sep 26).** ', '')), { mustSay: 'without its mark' })
scenario('a ruling copied into a second area file', true, c => { c.write(OTHER, AREA0.replace('general', 'other').replace(/^\| D2 .*\n/m, '')); addOther(c, 'D1') }, { mustSay: 'D1 now appears 2 times' })
scenario('an area file the map does not name', true, c => c.write(OTHER, '# Rulings — other\n'), { mustSay: 'is not in the map' })
/* An example row inside a code block is not a ruling (Astra's final read, 24 Sep 26). */
scenario('a lost ruling "replaced" by an example row in a code block', true, c => c.edit(AREA, t => t.replace(/^\| D1 \|.*\n/m, '') + '\n~~~md\n| D1 | 21 Sep 26 | an example | x | this file |\n~~~\n'), { mustSay: 'D1 is GONE' })
scenario('the map listing a ruling twice', true, c => setMap(c, AREA, 'D2, D1, D1'), { mustSay: 'twice under' })
/* Fable's final read, 24 Sep 26: a ruling filed and then dropped on the SAME branch, a row typed with odd
   spacing, and a mark naming a ruling that does not exist. */
const addD9 = (c, row) => { c.edit(AREA, t => t.replace('|---|---|---|---|---|\n', '|---|---|---|---|---|\n' + row + '\n')); setMap(c, AREA, 'D9, D2, D1') }
scenario('a ruling added in one commit and dropped in a later one', true, c => { addD9(c, '| D9 | 21 Sep 26 | z | z | this file |'); c.commit('file D9'); c.edit(AREA, t => t.replace(/^\| D9 \|.*\n/m, '')); setMap(c, AREA, 'D2, D1') }, { mustSay: 'D9 is GONE' })
scenario('a row typed with odd spacing is failed for its shape', true, c => addD9(c, '|D9| 21 Sep 26 | z | z | this file |'), { mustSay: 'not in the shape' })
scenario('an oddly spaced row, committed, then dropped', true, c => { addD9(c, '|D9 | 21 Sep 26 | z | z | this file |'); c.commit('file D9'); c.edit(AREA, t => t.replace(/^\|D9 \|.*\n/m, '')); setMap(c, AREA, 'D2, D1') }, { mustSay: 'D9 is GONE' })
scenario('a mark naming a ruling that does not exist', true, c => c.edit('DECISIONS-ARCHIVE.md', t => t.replace('**REPLACED BY D1 (21 Sep 26).**', '**REPLACED BY D1370 (21 Sep 26).**')), { mustSay: 'no such ruling exists' })
/* a real new area carries paths: (D137) — without them it would load in every chat (the misfiling check, D140) */
scenario('a ruling MOVED to another area, the map updated', false, c => { c.write(OTHER, '---\npaths:\n  - raptor-port/src/other/**\n---\n\n' + AREA0.replace('general', 'other').replace(/^\| D2 .*\n/m, '')); c.edit(AREA, t => t.replace(/^\| D1 .*\n/m, '')); addOther(c, 'D1'); setMap(c, AREA, 'D2') })
scenario('a register row deleted while the rule map still names it (F7)', true, c => c.edit('raptor-port/docs/superpowers/specs/x-behaviour-register.md', t => t.replace('- **X1** — the first rule.\n', '')), { mustSay: 'X1 is in' })

const addRow = (c, home) => { c.edit(AREA, t => t.replace('|---|---|---|---|---|\n', `|---|---|---|---|---|\n| D3 | 21 Sep 26 | c | c | ${home} |\n`)); setMap(c, AREA, 'D3, D2, D1') }
scenario('a new ruling whose home does not exist (F6)', true, c => addRow(c, '`docs/nowhere.md`'), { mustSay: 'no such file exists' })
scenario('a new ruling naming a home this change never wrote (D29\'s own defect)', true, c => addRow(c, '`OUTSTANDING.md`'), { mustSay: 'does not touch that file' })
scenario('a new ruling whose home was written in the same change', false, c => { addRow(c, '`OUTSTANDING.md`'); c.edit('OUTSTANDING.md', t => t + '\nThe ruling D3, carried here.\n') })
scenario('a new ruling with only a future home ("on build:")', false, c => addRow(c, 'this file; on build: `OUTSTANDING.md`'))

/* THE MOVER (F5): it must move exactly, refuse what it cannot do exactly, and undo itself. */
function mover(name, expectOk, { live, prep, node, args, check }) {
  const ctx = makeRepo(live)
  try {
    if (prep) prep(ctx)
    const r = spawnSync(process.execPath, [...(node ? node(ctx) : []), 'raptor-port/scripts/backlog-archive.mjs', ...args], { cwd: ctx.dir, encoding: 'utf8' })
    const why = check ? check(ctx, r) : ''
    const ok = (r.status === 0) === expectOk && !why
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'MISS'}  mover: ${name} — expected ${expectOk ? 'moved' : 'refused'}, got ${r.status === 0 ? 'moved' : 'refused'}${why ? ` (${why})` : ''}`)
    if (!ok) console.log((r.stdout + r.stderr).split('\n').map(l => '      ' + l).join('\n'))
  } finally { rmSync(ctx.dir, { recursive: true, force: true }) }
}
const has = (c, f, s) => c.read(f).includes(s)
const CRLF0 = LIVE0.replace(/\n/g, '\r\n')
mover('a clean move', true, { args: ['CHARLIE', '--homes', 'docs/home.md'], check: (c) =>
  has(c, 'OUTSTANDING.md', '[CHARLIE]') ? 'still in the backlog'
  : !has(c, 'OUTSTANDING-ARCHIVE.md', 'Line 6 of CHARLIE') ? 'not in the archive whole'
  : !has(c, 'OUTSTANDING.md', '## Done') ? 'swallowed the "## Done" heading after it'
  : !has(c, 'OUTSTANDING.md', '### [DELTA]') ? 'took the next item with it' : '' })
mover('no --homes', false, { args: ['CHARLIE'], check: c => has(c, 'OUTSTANDING.md', '[CHARLIE]') ? '' : 'moved anyway' })
/* two items archived the same day to the same home — each note names its item, so the doubled-body check has
   nothing to refuse (found 24 Sep 26: the second move was refused and put back) */
mover('two items to the same home on the same day', true, { prep: c => { c.write('raptor-port/docs/superpowers/specs/facts.md', 'Where the facts of CHARLIE and of BRAVO now live.\n'); const r = spawnSync(process.execPath, ['raptor-port/scripts/backlog-archive.mjs', 'CHARLIE', '--homes', 'raptor-port/docs/superpowers/specs/facts.md'], { cwd: c.dir, encoding: 'utf8' }); if (r.status !== 0) throw new Error('the first move failed: ' + r.stderr) }, args: ['BRAVO', '--homes', 'raptor-port/docs/superpowers/specs/facts.md'], check: c =>
  has(c, 'OUTSTANDING.md', '[BRAVO]') ? 'BRAVO is still in the backlog' : !has(c, 'OUTSTANDING-ARCHIVE.md', '([BRAVO]). Forward facts') ? 'the note does not name BRAVO' : '' })
mover('a home that shows nothing was written there', false, { prep: c => { c.write('raptor-port/docs/superpowers/specs/other.md', 'unrelated\n'); c.commit('other') }, args: ['CHARLIE', '--homes', 'raptor-port/docs/superpowers/specs/other.md'] })
mover('a duplicate id', false, { live: LIVE0 + '\n' + item('CHARLIE', 1).replace('Line 1 of CHARLIE', 'A second CHARLIE'), args: ['CHARLIE', '--homes', 'docs/home.md'], check: (c, r) => /heads 2 items/.test(r.stderr) ? '' : 'wrong reason' })
mover('line endings kept byte for byte', true, { live: CRLF0, args: ['CHARLIE', '--homes', 'docs/home.md'], check: c =>
  !c.read('OUTSTANDING-ARCHIVE.md').includes('Line 6 of CHARLIE, long enough to count as a real body line for the doubling check.\r\n') ? 'the moved lines lost their CRLF'
  : c.read('OUTSTANDING.md') !== CRLF0.replace(cut(CRLF0, 'CHARLIE')[1], '') ? 'the rest of the backlog changed' : '' })
mover('puts both files back when the inventory is not clean afterwards', false, { prep: c => c.edit('OUTSTANDING.md', t => cut(t, 'BRAVO')[0]), args: ['CHARLIE', '--homes', 'docs/home.md'], check: (c, r) =>
  !has(c, 'OUTSTANDING.md', '[CHARLIE]') ? 'CHARLIE was not put back' : has(c, 'OUTSTANDING-ARCHIVE.md', 'CHARLIE') ? 'the archive was not put back' : !/put back/.test(r.stderr) ? 'did not say so' : '' })

/* ---- Astra's review, 23 Sep 26: one scenario per finding, and the gaps it named ---- */
const moveTo = (c, id, shape) => { const [rest, blk] = cut(c.read('OUTSTANDING.md'), id); c.write('OUTSTANDING.md', rest); c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n' + shape(blk)) }
scenario('a line cut on the move that also exists in ANOTHER archived item (A1)', true, c => {
  c.edit('OUTSTANDING.md', t => t.replace('Line 3 of CHARLIE, long enough to count as a real body line for the doubling check.', 'Owner: Ops'))
  c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\nOwner: Ops\n'); c.commit('prep')
  moveTo(c, 'CHARLIE', b => b.replace('Owner: Ops\n', ''))
}, { mustSay: 'did not all arrive' })
scenario('one of two identical lines dropped on the move', true, c => {
  c.edit('OUTSTANDING.md', t => t.replace('Line 3 of CHARLIE, long enough to count as a real body line for the doubling check.', 'Same.').replace('Line 4 of CHARLIE, long enough to count as a real body line for the doubling check.', 'Same.')); c.commit('prep')
  moveTo(c, 'CHARLIE', b => b.replace('Same.\n', ''))
}, { mustSay: 'did not all arrive' })
scenario('an item ADDED on the branch, committed, then archived truncated (A2)', true, c => {
  c.edit('OUTSTANDING.md', t => t + '\n' + item('ECHO', 5)); c.commit('add ECHO')
  moveTo(c, 'ECHO', b => b.split('\n').slice(0, 3).join('\n') + '\n'); c.commit('archive ECHO')
}, { mustSay: '[ECHO] left' })
scenario('a ruling home DELETED from disk (A5)', true, c => { c.edit(AREA, t => t.replace('| D2 | 21 Sep 26 | b | b | `OUTSTANDING.md` |', '| D2 | 21 Sep 26 | b | b | `docs/home.md` |')); c.commit('point D2 at home'); rmSync(join(c.dir, 'docs/home.md')) }, { mustSay: 'no such file exists' })
scenario('a body line that only MENTIONS the allow syntax grants nothing (A6)', true, c => { c.edit('OUTSTANDING.md', t => cut(t, 'BRAVO')[0]); c.commit('drop BRAVO\n\nDocs-guard-allow: [BRAVO]\nThis is an example only, not an approval.') }, { mustSay: '[BRAVO] is GONE' })
scenario('a new rule whose register is new and not yet staged (A7)', false, c => { c.edit('raptor-port/scripts/rulecheck.mjs', t => t.replace("  X2: 'second rule',\n", "  X2: 'second rule',\n  X3: 'third rule',\n")); c.write('raptor-port/docs/superpowers/specs/new-behaviour-register.md', '- **X3** — the third rule.\n') })
scenario('an unusable DOCSGUARD_BASE still falls back and catches a loss', true, c => c.edit('OUTSTANDING.md', t => cut(t, 'BRAVO')[0]), { base: 'not-a-commit', mustSay: '[BRAVO] is GONE' })

const FENCED = LIVE0.replace('Line 2 of CHARLIE, long enough to count as a real body line for the doubling check.\n', 'Line 2 of CHARLIE, long enough to count as a real body line for the doubling check.\n~~~md\n## This is code, not a section\n~~~\n````md\n```\n## Nor is this\n```\n````\n')
mover('an item holding ~~~ and nested ```` code blocks moves WHOLE (A3)', true, { live: FENCED, args: ['CHARLIE', '--homes', 'docs/home.md'], check: c =>
  has(c, 'OUTSTANDING.md', 'Line 6 of CHARLIE') ? 'left the tail behind' : !has(c, 'OUTSTANDING-ARCHIVE.md', '## Nor is this') ? 'lost the code block' : '' })
mover('an id already in the archive', false, { prep: c => { c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n' + item('CHARLIE', 1).replace('Line 1 of CHARLIE', 'An older CHARLIE')); c.commit('old') }, args: ['CHARLIE', '--homes', 'docs/home.md'], check: (c, r) => /already heads an item/.test(r.stderr) ? '' : 'wrong reason' })
mover('a home that does not exist', false, { args: ['CHARLIE', '--homes', 'docs/nowhere.md'], check: (c, r) => /no such file/.test(r.stderr) ? '' : 'wrong reason' })
mover('a Windows backslash home that was changed on the branch (A9)', true, { prep: c => c.write('raptor-port/docs/superpowers/specs/other.md', 'facts, written just now\n'), args: ['CHARLIE', '--homes', 'raptor-port\\docs\\superpowers\\specs\\other.md'] })
mover('a home outside the repo', false, { args: ['CHARLIE', '--homes', '../outside.md'], check: (c, r) => /inside the repo/.test(r.stderr) ? '' : 'wrong reason' })

/* THE RULING MOVER (backlog-archive.mjs --rulings, D137): it moves a marked row whole, keeps the map true,
   and puts every file back when the inventory is not clean afterwards. */
mover('--rulings moves a replaced ruling to the archive and rewrites the map', true, { prep: c => { c.edit(AREA, t => t.replace('| D1 | 21 Sep 26 | a |', '| D1 | 21 Sep 26 | **REPLACED BY D2 (21 Sep 26).** a |')); c.commit('mark D1') }, args: ['--rulings'], check: c =>
  has(c, AREA, '| D1 |') ? 'D1 is still live'
  : !has(c, 'DECISIONS-ARCHIVE.md', '| D1 | 21 Sep 26 | **REPLACED BY D2 (21 Sep 26).** a | a | `OUTSTANDING.md` |') ? 'D1 did not arrive whole'
  : !c.read('DECISIONS.md').includes('| always | D0, D1 |') || !c.read('DECISIONS.md').includes('general.md` | always | D2 |') ? 'the map was not rewritten'
  : !/^## Moved /m.test(c.read('DECISIONS-ARCHIVE.md').split('| D0 |')[1]) ? 'no dated heading over the day it moved' : '' })
mover('--rulings leaves a marked example row inside a code block where it is', true, { prep: c => { c.edit(AREA, t => t + '\n~~~md\n| D8 | 21 Sep 26 | **SPENT 21 Sep 26 — an example.** x | x | this file |\n~~~\n'); c.commit('example') }, args: ['--rulings'], check: c =>
  !has(c, AREA, '| D8 |') ? 'the example was moved' : has(c, 'DECISIONS-ARCHIVE.md', '| D8 |') ? 'the example reached the archive' : c.read('DECISIONS.md').includes('D8') ? 'the example reached the map' : '' })
mover('--rulings puts a NEW ruling into the map', true, { prep: c => c.edit(AREA, t => t.replace('|---|---|---|---|---|\n', '|---|---|---|---|---|\n| D9 | 21 Sep 26 | z | z | this file |\n')), args: ['--rulings'], check: c =>
  !c.read('DECISIONS.md').includes('general.md` | always | D9, D2, D1 |') ? 'the map does not list D9 first' : '' })
mover('--rulings puts every file back when the inventory is not clean afterwards', false, { prep: c => { c.edit('OUTSTANDING.md', t => cut(t, 'BRAVO')[0]); c.edit(AREA, t => t.replace('| D1 | 21 Sep 26 | a |', '| D1 | 21 Sep 26 | **SPENT 21 Sep 26 — used.** a |')) }, args: ['--rulings'], check: (c, r) =>
  !has(c, AREA, '| D1 |') ? 'D1 was not put back' : has(c, 'DECISIONS-ARCHIVE.md', '| D1 |') ? 'the archive was not put back' : !/put back/.test(r.stderr) ? 'did not say so' : '' })

/* ---- THE SPRING CLEAN (owner, D138 + D140, 24 Sep 26) ---- */

/* [DOCSGUARD-MERGE]: a branch that merged `main` in (D78) still carries its own pre-merge commits, in which an item
   `main` later rewrote and archived was live with its OLDER text. That is not a second move; the gate must not
   compare the two. Replayed as a real merge graph, measured the way CI and the local run measure it — against
   the merge base with main. */
function mergeScenario(name, expectFail, build, mustSay) {
  const ctx = makeRepo()
  const g = (...a) => execFileSync('git', a, { cwd: ctx.dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  try {
    build(ctx, g)
    const r = spawnSync(process.execPath, ['raptor-port/scripts/docsize.mjs'], { cwd: ctx.dir, encoding: 'utf8', env: { ...process.env, DOCSGUARD_BASE: '', DOCSGUARD_ALLOW: '' } })
    const out = r.stdout + r.stderr, didFail = r.status !== 0, said = !mustSay || out.includes(mustSay)
    const ok = didFail === expectFail && said
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'MISS'}  ${name} — expected ${expectFail ? 'FAIL' : 'OK'}, got ${didFail ? 'FAIL' : 'OK'}${said ? '' : ` (output lacks "${mustSay}")`}`)
    if (!ok) console.log(out.split('\n').map(l => '      ' + l).join('\n'))
  } finally { rmSync(ctx.dir, { recursive: true, force: true }) }
}
const branchThenMainArchives = (c, g) => {
  g('checkout', '-q', '-b', 'feature')
  c.edit('OUTSTANDING.md', t => t.replace('Line 1 of ALPHA', 'Line 1 of ALPHA, edited on the branch')); c.commit('the branch touches the backlog')
  g('checkout', '-q', 'main')
  c.edit('OUTSTANDING.md', t => t.replace('### [CHARLIE] The CHARLIE item — OPEN', '### [CHARLIE] The CHARLIE item — DONE').replace('Line 6 of CHARLIE', 'Closed on main: line 6 of CHARLIE')); c.commit('main closes CHARLIE')
  const [rest, blk] = cut(c.read('OUTSTANDING.md'), 'CHARLIE'); c.write('OUTSTANDING.md', rest); c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n' + blk); c.commit('main archives CHARLIE')
  g('checkout', '-q', 'feature')
  g('merge', '-q', '--no-edit', 'main')
}
mergeScenario('[DOCSGUARD-MERGE] a branch that merged main in, where main had rewritten and archived an item', false, branchThenMainArchives)
mergeScenario('[DOCSGUARD-MERGE] …and a real loss on that branch is still caught', true, (c, g) => { branchThenMainArchives(c, g); c.edit('OUTSTANDING.md', t => cut(t, 'BRAVO')[0]) }, '[BRAVO] is GONE')

/* MISFILING (D140): a document put where the structure has no place for it fails — with the inventory, so at the end
   of every turn — and only what is NEW since the base is judged. */
scenario('a new Markdown file at the repo root (a plan left at the root)', true, c => c.write('PLAN.md', '# a plan\n'), { mustSay: 'new Markdown file at the repo root' })
scenario('a new root file on the allowlist (AGENTS.md, for Codex)', false, c => c.write('AGENTS.md', '# for Codex\n'))
scenario('a new document outside the one docs tree', true, c => c.write('docs/notes/x.md', '# x\n'), { mustSay: 'outside the one docs tree' })
scenario('a new always-loaded rules file nobody registered', true, c => c.write('.claude/rules/new-rule.md', '# a rule for every chat\n'), { mustSay: 'loads in EVERY chat' })
scenario('a new rules file scoped by paths: (loads only with its area)', false, c => c.write('.claude/rules/area-x.md', '---\npaths:\n  - raptor-port/src/x/**\n---\n\n# x\n'))
const NOW = (...bs) => ['# HANDOFF', '', '## Now', '', ...bs.flatMap(b => [`<!-- now:${b} -->`, `### ${b}`, 'where it stands', '<!-- /now -->', '']), '## Next, in order', ''].join('\n')
scenario('two ## Now blocks for one branch', true, c => c.write('HANDOFF.md', NOW('claude/x', 'claude/x')), { mustSay: '## Now blocks for claude/x' })
scenario('one ## Now block per branch', false, c => c.write('HANDOFF.md', NOW('claude/x', 'claude/y')))
scenario('a new top-level reference doc that no map names', true, c => c.write('raptor-port/docs/newref.md', '# new\n'), { mustSay: 'no map names' })
scenario('a new top-level reference doc on the map', false, c => { c.write('raptor-port/docs/newref.md', '# new\n'); c.write('raptor-port/CLAUDE.md', '| the new reference | `docs/newref.md` |\n') })
scenario('a design for one task, under superpowers/ (tier 3, no map needed)', false, c => c.write('raptor-port/docs/superpowers/specs/2026-09-24-x.md', '# x\n'))
scenario('over a ceiling says it is a tripwire, not a target (D141)', true, c => c.edit('OUTSTANDING.md', t => t + 'x\n'.repeat(1400)), { mustSay: 'TRIPWIRE' })
scenario('a new area rulings file with no paths: (it would load in every chat)', true, c => c.write(OTHER, '# Rulings — other\n'), { mustSay: 'loads in EVERY chat' })

/* THE TEXT MOVER (backlog-archive.mjs --move, D138): exact, or nothing. */
const SRC = 'raptor-port/docs/superpowers/specs/a.md', DST = 'raptor-port/docs/superpowers/specs/b.md'
const SRC0 = ['# A', '', '## One', 'one body', '', '## Two', 'two body', '~~~md', '## Not a heading', '~~~', 'two tail', '', '## Three', 'three body', ''].join('\n')
const DST0 = ['# B', '', '## Landing', 'landing body', '', '## After', 'after body', ''].join('\n')
const TWO = '## Two\ntwo body\n~~~md\n## Not a heading\n~~~\ntwo tail\n\n'
const docs = (c, a = SRC0, b = DST0) => { c.write(SRC, a); c.write(DST, b); c.commit('two docs') }
const moveTwo = (...more) => ['--move', SRC, '--from', '## Two', '--section', '--dest', DST, ...more]
mover('--move: a section, fenced heading and all, to the end of a heading\'s section, with a pointer', true, { prep: c => docs(c), args: moveTwo('--under', '## Landing', '--pointer', '- Two now lives in b.md'), check: c =>
  c.read(DST).split(TWO).length !== 2 ? 'the section did not arrive exactly once, whole'
  : c.read(DST).indexOf(TWO) > c.read(DST).indexOf('## After') || c.read(DST).indexOf(TWO) < c.read(DST).indexOf('landing body') ? 'it did not land inside ## Landing'
  : c.read(SRC) !== ['# A', '', '## One', 'one body', '', '- Two now lives in b.md', '## Three', 'three body', ''].join('\n') ? 'the source is not exactly what was left plus the pointer' : '' })
mover('--move: a start line that repeats (once in a code block) is refused', false, { prep: c => docs(c, SRC0.replace('## Three', '~~~\n## Two\n~~~\n## Three')), args: moveTwo('--no-pointer'), check: (c, r) => /matches 2/.test(r.stderr) ? '' : 'wrong reason' })
mover('--move: a start line inside a code block is refused', false, { prep: c => docs(c), args: ['--move', SRC, '--from', '## Not a heading', '--section', '--dest', DST, '--no-pointer'], check: (c, r) => /inside a code block/.test(r.stderr) ? '' : 'wrong reason' })
mover('--move: a heading the destination lacks is refused without --create-under', false, { prep: c => docs(c), args: moveTwo('--under', '## Nowhere', '--no-pointer'), check: (c, r) => /is not a line of/.test(r.stderr) && c.read(SRC) === SRC0 ? '' : 'wrong reason, or the source changed' })
mover('--move: --create-under makes the heading at the end', true, { prep: c => docs(c), args: moveTwo('--under', '## Moved here', '--create-under', '--no-pointer'), check: c => c.read(DST).endsWith('## Moved here\n\n' + TWO) ? '' : 'not under a new heading at the end' })
mover('--move: a pointer that does not name the destination is refused', false, { prep: c => docs(c), args: moveTwo('--pointer', '- moved elsewhere'), check: (c, r) => /must name the destination/.test(r.stderr) ? '' : 'wrong reason' })
mover('--move: a pointer that would occur twice is refused', false, { prep: c => docs(c, SRC0 + '- see b.md\n'), args: moveTwo('--pointer', '- see b.md'), check: (c, r) => /more than once/.test(r.stderr) ? '' : 'wrong reason' })
mover('--move: neither --pointer nor --no-pointer is refused', false, { prep: c => docs(c), args: moveTwo(), check: (c, r) => /usage/.test(r.stderr) ? '' : 'wrong reason' })
mover('--move: a block holding a backlog item is refused (use the item mover)', false, { prep: c => docs(c, SRC0.replace('two body', '### [ZULU] an item')), args: moveTwo('--no-pointer'), check: (c, r) => /backlog item/.test(r.stderr) ? '' : 'wrong reason' })
mover('--move: a block holding a ruling row is refused (use --rulings)', false, { prep: c => docs(c, SRC0.replace('two body', '| D9 | 21 Sep 26 | z | z | this file |')), args: moveTwo('--no-pointer'), check: (c, r) => /ruling row/.test(r.stderr) ? '' : 'wrong reason' })
mover('--move: a CRLF source into an LF destination is refused', false, { prep: c => docs(c, SRC0.replace(/\n/g, '\r\n')), args: moveTwo('--no-pointer'), check: (c, r) => /line ending/.test(r.stderr) ? '' : 'wrong reason' })
/* The failure is INJECTED, not arranged: a module loaded before the mover makes its second rename throw, after the
   first has already replaced the source. It used to be arranged by making the destination read-only, which fails
   only on Windows (it will not replace a read-only file); Linux replaces it anyway, so on GitHub the move went
   through and this reported a MISS the first time the Docs guard ran it (24 Sep 26, PR #433). */
const FAIL_SECOND_RENAME = "import fs from 'node:fs'; import { syncBuiltinESMExports } from 'node:module'; const real = fs.renameSync; let n = 0; fs.renameSync = (...a) => { if (++n === 2) { const e = new Error('the second rename, failed on purpose by the self-test'); e.code = 'EACCES'; throw e } return real(...a) }; syncBuiltinESMExports()\n"
mover('--move: the SECOND write failing puts the first file back', false, { prep: c => { docs(c); c.write('fail-second-rename.mjs', FAIL_SECOND_RENAME) }, node: c => ['--import', pathToFileURL(join(c.dir, 'fail-second-rename.mjs')).href], args: moveTwo('--no-pointer'), check: (c, r) =>
  c.read(SRC) !== SRC0 ? 'the source was not put back' : c.read(DST) !== DST0 ? 'the destination changed' : !/put back/.test(r.stderr) ? 'did not say so' : existsSync(join(c.dir, SRC) + '.docmove-tmp') || existsSync(join(c.dir, DST) + '.docmove-tmp') ? 'left a temporary copy' : '' })

/* THE STOP HOOK (A8) — needs bash; skipped, and said so, where there is none. */
const HOOK = join(HERE, '..', '..', '.claude', 'hooks', 'backlog-guard.sh')
const bash = spawnSync('bash', ['--version'], { encoding: 'utf8' }).status === 0
function hook(name, expect, { prep, input }) {
  if (!bash) { console.log(`SKIP  hook: ${name} — no bash here`); return }
  const ctx = makeRepo()
  try {
    if (prep) prep(ctx)
    const r = spawnSync('bash', [HOOK], { input, encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: ctx.dir } })
    const ok = r.status === expect
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'MISS'}  hook: ${name} — expected exit ${expect}, got ${r.status}`)
    if (!ok) console.log((r.stdout + r.stderr).split('\n').map(l => '      ' + l).join('\n'))
  } finally { rmSync(ctx.dir, { recursive: true, force: true }) }
}
const loseBravo = c => c.edit('OUTSTANDING.md', t => cut(t, 'BRAVO')[0])
hook('clean', 0, { input: '{}' })
hook('a lost record hands the turn back', 2, { prep: loseBravo, input: '{"stop_hook_active":false}' })
hook('already holding the turn, with odd JSON spacing, lets go', 0, { prep: loseBravo, input: '{\n  "stop_hook_active" :\n  true\n}' })
hook('over a line ceiling never blocks a turn', 0, { prep: c => c.edit('DECISIONS.md', t => t + 'x\n'.repeat(200)), input: '{}' })
hook('no gate script in the project', 0, { prep: c => rmSync(join(c.dir, 'raptor-port/scripts/docsize.mjs')), input: '{}' })
hook('a misfiled document hands the turn back (D140)', 2, { prep: c => c.write('PLAN.md', '# a plan left at the root\n'), input: '{}' })

console.log(failed ? `\nSELFTEST FAILED — ${failed} scenario(s) not caught as designed.` : '\nselftest OK — every scenario behaved as designed.')
process.exit(failed ? 1 : 0)
