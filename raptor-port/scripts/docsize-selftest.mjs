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
import * as READS from './docsize-reads.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const GATE = join(HERE, 'docsize.mjs')
const MOVER = join(HERE, 'backlog-archive.mjs')

const item = (id, n) => [`### [${id}] The ${id} item — OPEN`, '', ...Array.from({ length: n }, (_, i) => `Line ${i + 1} of ${id}, long enough to count as a real body line for the doubling check.`), ''].join('\n')
const LIVE0 = ['# Outstanding', '', '## Items', '', item('ALPHA', 6), item('BRAVO', 6), item('CHARLIE', 6), '## Done', '', item('DELTA', 3)].join('\n')
const ARCH0 = ['# Archive', '', item('OLD', 3)].join('\n')
const RULES0 = "const RULES = {\n  X1: 'first rule',\n  X2: 'second rule',\n}\n"
const REG0 = ['# Register', '', '- **X1** — the first rule.', '', '| X2 | the second rule |', ''].join('\n')
/* The rulings in the D390 shape: each ruling is a SHORT LINE in its area file and a FULL ROW, whole, in the same-named
   file under .claude/decisions-full/; DECISIONS.md holds only the map; the archive holds one row already marked as
   replaced. The full row's meaning cell opens with its bold heading, which is also its short line. */
const AREA = '.claude/rules/decisions/general.md'
const FULL = '.claude/decisions-full/general.md'
const fullRow = (d, w, home = '`OUTSTANDING.md`', date = '21 Sep 26') => `| ${d} | ${date} | ${w} | **Rule ${w}.** ${w} | ${home} |`
const shortRow = (d, w, tail = '', date = '21 Sep 26') => `| ${d} | ${date} | Rule ${w}.${tail} |`
const AREA0 = ['# Rulings — general', '', '| # | Date | The rule |', '|---|---|---|', shortRow('D2', 'b'), shortRow('D1', 'a'), ''].join('\n')
const FULL0 = ['# Rulings — general: the full rows', '', '| # | Date | ruling | meaning | home |', '|---|---|---|---|---|', fullRow('D2', 'b'), fullRow('D1', 'a'), ''].join('\n')
/* the layout before D390, for the converter's and --merge's tests */
const AREA_OLD = ['# Rulings — general', '', 'Also read — nothing yet.', '', '| # | Date | ruling | meaning | home |', '|---|---|---|---|---|', fullRow('D2', 'b'), fullRow('D1', 'a'), ''].join('\n')
const DARCH0 = ['# Archive', '', '## Moved 21 Sep 26', '', '| # | Date | ruling | meaning | home |', '|---|---|---|---|---|', '| D0 | 20 Sep 26 | **REPLACED BY D1 (21 Sep 26).** z | z | `OUTSTANDING.md` |', ''].join('\n')
const mapRow = (area, file, ids) => '| ' + area + ' | ' + '`' + file + '`' + ' | always | ' + ids + ' |'
const DEC0 = ['# DECISIONS', '', '| Area | File | Loads by itself | Rulings |', '|---|---|---|---|', mapRow('General', AREA, 'D2, D1'), mapRow('Archive', 'DECISIONS-ARCHIVE.md', 'D0'), ''].join('\n')
/* HANDOFF.md in its shape ([HANDOFF-SHAPE-GUARD]): three headings in order, a block per chat under ## Now, each
   closed by its end marker; the second block carries the Gates line the 25 Sep 26 span replace started from. */
const HANDOFF0 = ['# HANDOFF', '', 'Read this first.', '', '## Now', '',
  '<!-- now:claude/a -->', '### `claude/a` — where it stands', '- a line', '<!-- /now -->', '',
  '<!-- now:claude/b -->', '### `claude/b` — where it stands', '- b line', '- **Gates:** green', '<!-- /now -->', '',
  '## Next, in order', '', '1. the order', '', '## Gate baseline', '', 'The counts.', '', '## Standing constraints', '', '- none', ''].join('\n')
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
  /* the gate with a byte tripwire for the test's own area files (every area file needs one — D390) */
  const gate = readFileSync(GATE, 'utf8').replace('const RULING_BYTES = [\n', "const RULING_BYTES = [\n  ['.claude/rules/decisions/general.md', 2, 6000],\n  ['.claude/rules/decisions/other.md', 2, 6000],\n  ['.claude/rules/decisions/fourth.md', 2, 6000],\n")
  if (!gate.includes("general.md', 2, 6000")) throw new Error('RULING_BYTES was not found in docsize.mjs — update this self-test')
  w('raptor-port/scripts/docsize.mjs', gate)
  w('raptor-port/scripts/docsize-rulings.mjs', readFileSync(join(HERE, 'docsize-rulings.mjs'), 'utf8'))
  w('raptor-port/scripts/backlog-archive.mjs', readFileSync(MOVER, 'utf8'))
  w('raptor-port/scripts/rulecheck.mjs', RULES0)
  w('raptor-port/docs/superpowers/specs/x-behaviour-register.md', REG0)
  w('OUTSTANDING.md', live); w('OUTSTANDING-ARCHIVE.md', ARCH0); w('DECISIONS.md', DEC0); w(AREA, AREA0); w(FULL, FULL0); w('DECISIONS-ARCHIVE.md', DARCH0)
  w('HANDOFF.md', HANDOFF0)
  w('raptor-port/src/app.ts', 'export const a = 1\n')
  w('docs/home.md', 'Where the facts of CHARLIE now live.\n')
  g('add', '-A'); g('commit', '-q', '-m', 'base')
  const base = g('rev-parse', 'HEAD').trim()
  return {
    dir, base, git: g,
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
/* [DOCSIZE-MERGE-CEILING] (21 Oct 26): a merge of main that CARRIES main's own docs-only ceiling move, beside code on
   both sides, is not a ceiling moved with code — compared with its first parent it read as one (29 Sep 26). The branch
   and main both touch the gate's file (so the merge is not the same as either side) and the same source file. A
   ceiling the merge sets ITSELF, or one moved with code on the branch before the merge, still fails. */
const setCeiling = (file, n) => t => {
  const u = t.replace(new RegExp(`(\\['${file.replace(/[.]/g, '\\.')}',\\s+\\d+,\\s+)\\d+\\]`), `$1${n}]`)
  if (u === t) throw new Error(`the ${file} ceiling row was not found or already ${n} — update this self-test`)
  return u
}
const mergeMainWithRaise = (c, { evil = false, branchMoves = false, pending = false } = {}) => {
  c.git('switch', '-q', '-c', 'feature')
  c.edit('raptor-port/scripts/docsize.mjs', t => t + '// the branch has a note of its own here\n')
  if (branchMoves) c.edit('raptor-port/scripts/docsize.mjs', setCeiling('raptor-port/CLAUDE.md', 999))
  c.edit('raptor-port/src/app.ts', t => t + 'export const b = 2\n'); c.commit('the branch: code')
  c.git('switch', '-q', 'main')
  c.edit('raptor-port/scripts/docsize.mjs', raiseDecisions); c.commit('main: raise, with its reason, docs only')
  c.edit('raptor-port/src/app.ts', t => 'export const z = 0\n' + t); c.commit('main: code')
  c.git('switch', '-q', 'feature')
  c.git('merge', '-q', '--no-ff', '--no-edit', ...(evil || pending ? ['--no-commit'] : []), 'main')
  if (evil) c.edit('raptor-port/scripts/docsize.mjs', setCeiling('DECISIONS.md', 500))
  if (evil && !pending) c.commit('merge main')
}
/* the same merge while it is still being made (not yet committed) — the check is run mid-merge, while resolving */
scenario('the same merge, not yet committed', false, c => mergeMainWithRaise(c, { pending: true }))
scenario('a ceiling set while the merge is still being made, with code', true, c => mergeMainWithRaise(c, { evil: true, pending: true }), { mustSay: 'the merge in progress' })
scenario('a merge of main that carried main\'s own docs-only ceiling move, code on both sides', false, c => mergeMainWithRaise(c))
scenario('a ceiling the merge itself sets (neither side\'s value), with code', true, c => mergeMainWithRaise(c, { evil: true }), { mustSay: 'touches raptor-port/src' })
scenario('a ceiling moved with code on the branch, then main merged in', true, c => mergeMainWithRaise(c, { branchMoves: true }), { mustSay: 'touches raptor-port/src' })

/* THE RULINGS (F7, D137, D390). A ruling is a full row in the full-text folder and a short line in its area file; a
   number is never lost or doubled, the map agrees with the files, and every live full row has one short line. */
const topOf = (t, line) => t.replace(/(\|---\|[-|]*\n)/, `$1${line}\n`)
const dropD = (t, d) => t.replace(new RegExp(`^\\|\\s*${d}\\s*\\|.*\\n`, 'm'), '')
const addBoth = (c, d, w, { full, short, map = true, home } = {}) => { c.edit(FULL, t => topOf(t, full ?? fullRow(d, w, home ?? 'this file'))); c.edit(AREA, t => topOf(t, short ?? shortRow(d, w))); if (map) setMap(c, AREA, `${d}, D2, D1`) }
scenario('a ruling number lost from both its files (F7)', true, c => { c.edit(FULL, t => dropD(t, 'D1')); c.edit(AREA, t => dropD(t, 'D1')); setMap(c, AREA, 'D2') }, { mustSay: 'D1 is GONE' })
scenario('a ruling\'s full row lost, its short line left', true, c => c.edit(FULL, t => dropD(t, 'D1')), { mustSay: 'D1 is GONE' })
scenario('a ruling number newly used twice (F7)', true, c => c.edit(FULL, t => t.replace('| D2 | 21 Sep 26 | b |', '| D1 | 21 Sep 26 | b |')), { mustSay: 'D1 now appears 2 times' })
scenario('a ruling number skipped — a parallel branch holds the range', false, c => addBoth(c, 'D9', 'z'))

/* THE STRUCTURE KEEPS ITSELF (D137, D390) — a ruling in the map file, a map out of step, a marked row left live, a row
   copied to two areas, a short line and its full row out of step: each FAILS by name; clean moves pass. */
const OTHER = '.claude/rules/decisions/other.md', OTHER_FULL = '.claude/decisions-full/other.md'
const OTHER_HEAD = '---\npaths:\n  - raptor-port/src/other/**\n---\n\n# Rulings — other\n\n| # | Date | The rule |\n|---|---|---|\n'
const addOther = (c, ids) => c.edit('DECISIONS.md', t => t.replace('| Archive |', mapRow('Other', OTHER, ids) + '\n| Archive |'))
scenario('the rulings in the D390 shape, unchanged', false, () => {})
scenario('a ruling written in DECISIONS.md instead of its area', true, c => c.edit('DECISIONS.md', t => t + '\n' + fullRow('D9', 'z') + '\n'), { mustSay: 'is written in DECISIONS.md' })
scenario('a new ruling the map does not list', true, c => addBoth(c, 'D9', 'z', { map: false }), { mustSay: 'does not match the files' })
scenario('the map listing a ruling its file does not hold', true, c => setMap(c, AREA, 'D2, D1, D7'), { mustSay: 'does not match the files' })
scenario('a replaced ruling left live in the full-text folder', true, c => c.edit(FULL, t => t.replace('| D1 | 21 Sep 26 | a |', '| D1 | 21 Sep 26 | **REPLACED BY D2 (21 Sep 26).** a |')), { mustSay: 'backlog-archive.mjs --rulings' })
scenario('a spent permission left live', true, c => c.edit(FULL, t => t.replace('| D1 | 21 Sep 26 | a |', '| D1 | 21 Sep 26 | **SPENT 21 Sep 26 — merged.** a |')), { mustSay: 'marked replaced/spent' })
scenario('an archived row without its mark', true, c => c.edit('DECISIONS-ARCHIVE.md', t => t.replace('**REPLACED BY D1 (21 Sep 26).** ', '')), { mustSay: 'without its mark' })
scenario('a ruling copied into a second area', true, c => { c.write(OTHER, OTHER_HEAD + shortRow('D1', 'a') + '\n'); c.write(OTHER_FULL, FULL0.replace('general', 'other').replace(/^\| D2 .*\n/m, '')); addOther(c, 'D1') }, { mustSay: 'D1 now appears 2 times' })
scenario('an area file the map does not name', true, c => c.write(OTHER, OTHER_HEAD), { mustSay: 'is not in the map' })
/* An example row inside a code block is not a ruling (Astra's final read, 24 Sep 26). */
scenario('a lost ruling "replaced" by an example row in a code block', true, c => { c.edit(FULL, t => dropD(t, 'D1') + '\n~~~md\n' + fullRow('D1', 'example') + '\n~~~\n'); c.edit(AREA, t => dropD(t, 'D1')); setMap(c, AREA, 'D2') }, { mustSay: 'D1 is GONE' })
scenario('the map listing a ruling twice', true, c => setMap(c, AREA, 'D2, D1, D1'), { mustSay: 'twice under' })
/* Fable's final read, 24 Sep 26: a ruling filed and then dropped on the SAME branch, a row typed with odd
   spacing, and a mark naming a ruling that does not exist. */
scenario('a ruling added in one commit and dropped in a later one', true, c => { addBoth(c, 'D9', 'z'); c.commit('file D9'); c.edit(FULL, t => dropD(t, 'D9')); c.edit(AREA, t => dropD(t, 'D9')); setMap(c, AREA, 'D2, D1') }, { mustSay: 'D9 is GONE' })
scenario('a row typed with odd spacing is failed for its shape', true, c => addBoth(c, 'D9', 'z', { full: '|D9| 21 Sep 26 | z | **Rule z.** z | this file |' }), { mustSay: 'not in the shape' })
scenario('an oddly spaced row, committed, then dropped', true, c => { addBoth(c, 'D9', 'z', { full: '|D9 | 21 Sep 26 | z | **Rule z.** z | this file |' }); c.commit('file D9'); c.edit(FULL, t => dropD(t, 'D9')); c.edit(AREA, t => dropD(t, 'D9')); setMap(c, AREA, 'D2, D1') }, { mustSay: 'D9 is GONE' })
scenario('a mark naming a ruling that does not exist', true, c => c.edit('DECISIONS-ARCHIVE.md', t => t.replace('**REPLACED BY D1 (21 Sep 26).**', '**REPLACED BY D1370 (21 Sep 26).**')), { mustSay: 'no such ruling exists' })
/* a real new area carries paths: (D137) — without them it would load in every chat (the misfiling check, D140) */
scenario('a ruling MOVED to another area, the map updated', false, c => { c.write(OTHER, OTHER_HEAD + shortRow('D1', 'a') + '\n'); c.write(OTHER_FULL, FULL0.replace('general', 'other').replace(/^\| D2 .*\n/m, '')); c.edit(FULL, t => dropD(t, 'D1')); c.edit(AREA, t => dropD(t, 'D1')); addOther(c, 'D1'); setMap(c, AREA, 'D2') })
scenario('a register row deleted while the rule map still names it (F7)', true, c => c.edit('raptor-port/docs/superpowers/specs/x-behaviour-register.md', t => t.replace('- **X1** — the first rule.\n', '')), { mustSay: 'X1 is in' })

/* THE SHORT LINES (D390): one per live full row, the same area and date, within the cap, their change tail naming
   exactly what the full row's marks name; a full row left in an area file is a new ruling not yet converted. */
scenario('a full row left in an area file', true, c => { c.edit(AREA, t => topOf(t, fullRow('D9', 'z'))); setMap(c, AREA, 'D9, D2, D1') }, { mustSay: 'is still in .claude/rules/decisions/general.md' })
scenario('…and one whose heading cannot serve says so, before the converter is run', true, c => { c.edit(AREA, t => topOf(t, '| D9 | 21 Sep 26 | z | **Three things:** z | `OUTSTANDING.md` |')); setMap(c, AREA, 'D9, D2, D1') }, { mustSay: 'the converter will refuse it' })
scenario('a short line with no full row', true, c => { c.edit(AREA, t => topOf(t, shortRow('D9', 'z'))); setMap(c, AREA, 'D9, D2, D1') }, { mustSay: 'has no full row' })
scenario('a full row with no short line', true, c => c.edit(FULL, t => topOf(t, fullRow('D9', 'z'))), { mustSay: 'has no short line' })
scenario('a short line whose date is not its full row\'s', true, c => c.edit(AREA, t => t.replace(shortRow('D1', 'a'), shortRow('D1', 'a', '', '22 Sep 26'))), { mustSay: 'the date is the full row' })
scenario('a short line over the cap', true, c => c.edit(AREA, t => t.replace(shortRow('D1', 'a'), `| D1 | 21 Sep 26 | ${'x'.repeat(351)} |`)), { mustSay: 'at most 350' })
const narrowD1 = c => c.edit(FULL, t => t.replace('| D1 | 21 Sep 26 | a | **Rule a.** a |', '| D1 | 21 Sep 26 | a | **— NARROWED 22 Sep 26 BY D2: only b.** **Rule a.** a |'))
scenario('a change mark its short line does not name', true, narrowD1, { mustSay: 'does not name D2' })
scenario('a change tail naming a ruling the full row has no mark for', true, c => c.edit(AREA, t => t.replace(shortRow('D1', 'a'), shortRow('D1', 'a', ' — changed by D2'))), { mustSay: 'carries no mark for' })
scenario('a change mark and its tail, in step', false, c => { narrowD1(c); c.edit(AREA, t => t.replace(shortRow('D1', 'a'), shortRow('D1', 'a', ' — changed by D2'))) })
scenario('a row with five column dividers (a cell missing)', true, c => c.edit(FULL, t => t.replace(fullRow('D1', 'a'), '| D1 | 21 Sep 26 | a | **Rule a.** a `OUTSTANDING.md` |')), { mustSay: 'column dividers' })
scenario('a short line holding a "|" is a row of the wrong shape', true, c => c.edit(AREA, t => t.replace(shortRow('D1', 'a'), '| D1 | 21 Sep 26 | Rule a|b. |')), { mustSay: 'column dividers' })
scenario('an area file with no byte tripwire', true, c => { c.write('.claude/rules/decisions/third.md', OTHER_HEAD.replace('other', 'third')); c.edit('DECISIONS.md', t => t.replace('| Archive |', mapRow('Third', '.claude/rules/decisions/third.md', '—') + '\n| Archive |')) }, { mustSay: 'no byte tripwire' })
scenario('a NEW row that changes an older one the older one does not name (back-mark)', true, c => addBoth(c, 'D9', 'z', { full: '| D9 | 21 Sep 26 | z | **Rule z.** Narrows D1 for one case. | `OUTSTANDING.md` |' }), { mustSay: 'carries no mark naming D9' })
scenario('…and with the older row marked and its tail in step, it passes', false, c => { addBoth(c, 'D9', 'z', { full: '| D9 | 21 Sep 26 | z | **Rule z.** Narrows D1 for one case. | this file |' }); c.edit(FULL, t => t.replace('| D1 | 21 Sep 26 | a | **Rule a.** a |', '| D1 | 21 Sep 26 | a | **— NARROWED 21 Sep 26 BY D9: one case.** **Rule a.** a |')); c.edit(AREA, t => t.replace(shortRow('D1', 'a'), shortRow('D1', 'a', ' — changed by D9'))) })
scenario('a rulings area file over its byte tripwire on a docs-only change', true, c => c.edit(AREA, t => t + '\n' + 'Prose. '.repeat(1000) + '\n'), { mustSay: 'bytes over its tripwire' })

const addRow = (c, home) => addBoth(c, 'D3', 'c', { home })
scenario('a new ruling whose home does not exist (F6)', true, c => addRow(c, '`docs/nowhere.md`'), { mustSay: 'no such file exists' })
scenario('a new ruling naming a home this change never wrote (D29\'s own defect)', true, c => addRow(c, '`OUTSTANDING.md`'), { mustSay: 'does not touch that file' })
scenario('a new ruling whose home was written in the same change', false, c => { addRow(c, '`OUTSTANDING.md`'); c.edit('OUTSTANDING.md', t => t + '\nThe ruling D3, carried here.\n') })
scenario('a new ruling with only a future home ("on build:")', false, c => addRow(c, 'this file; on build: `OUTSTANDING.md`'))
/* [RULING-HOMES-AUDIT] (28 Sep 26): a document home must also SAY the new ruling's number — touching it is not carrying it */
scenario('a new ruling whose home was touched but never names its number', true, c => { addRow(c, '`OUTSTANDING.md`'); c.edit('OUTSTANDING.md', t => t + '\nThe ruling, carried here without its number.\n') }, { mustSay: 'never mentions D3' })
scenario('a new ruling whose home names it only inside a longer number (D30)', true, c => { addRow(c, '`OUTSTANDING.md`'); c.edit('OUTSTANDING.md', t => t + '\nThe ruling D30, a different one.\n') }, { mustSay: 'never mentions D3' })
scenario('a new ruling whose home names it inside a range (D1–D3)', false, c => { addRow(c, '`OUTSTANDING.md`'); c.edit('OUTSTANDING.md', t => t + '\nThe rulings D1–D3, carried here.\n') })
scenario('a new ruling homed in the append-only archive needs no number there', false, c => { addRow(c, '`OUTSTANDING-ARCHIVE.md`'); c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\nA note appended.\n') })
scenario('a short line naming a path is not read as a home', false, c => c.edit(AREA, t => t.replace(shortRow('D1', 'a'), '| D1 | 21 Sep 26 | Rule a, built in `docs/nowhere.md`. |')))

/* THE PAGES (owner, D1735, 7 Nov 26 — the rules diet, plan raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md
   §5): an area converted to a page of how it works now, beside one still in short lines — both shapes in one repo, as
   while the areas convert one at a time. Each check fails by name; the legitimate pages pass. */
const PAGE_HEAD = '---\npaths:\n  - raptor-port/src/other/**\n---\n\n<!-- shape: page -->\n\n# Other — how it works now\n\nEach line states a rule as it stands, the rulings behind it after it; their full rows are searched.\n\n'
const otherPage = ({ topic = ['- Rule five holds on every screen of the other area [D5].'], settled = ['- The other screen keeps the look it was built with [D6].'], from = ['- General: rule a bears on the other area too [D1].'], noFrom = false } = {}) =>
  PAGE_HEAD + ['## The rules', ...topic, '', '## Settled designs, by screen', ...settled, '', ...(noFrom ? [] : ['## From other areas', ...from, ''])].join('\n')
const OTHER_FULL0 = ['# Rulings — other: the full rows', '', '| # | Date | ruling | meaning | home |', '|---|---|---|---|---|', fullRow('D6', 'f', 'this file'), fullRow('D5', 'e', 'this file'), ''].join('\n')
const withD7 = topOf(OTHER_FULL0, fullRow('D7', 'g', 'this file'))
const withPage = (c, page = {}, { full = OTHER_FULL0, ids = 'D6, D5' } = {}) => { c.write(OTHER, typeof page === 'string' ? page : otherPage(page)); c.write(OTHER_FULL, full); addOther(c, ids) }
const narrowD5 = full => full.replace('| D5 | 21 Sep 26 | e | **Rule e.** e |', '| D5 | 21 Sep 26 | e | **— NARROWED 22 Sep 26 BY D2: only on Mondays.** **Rule e.** e |')
const RULE_FILE = '.claude/rules/shipping.md'
const GENERAL_PAGE = '<!-- shape: page -->\n\n# General — how it works now\n\n- Rule a holds in every chat, whatever the area [D1].\n- Rule b holds in every chat, whatever the area [D2].\n'
scenario('an area converted to a page beside one still in short lines (both shapes)', false, c => withPage(c))
scenario('a page\'s live ruling stated nowhere', true, c => withPage(c, {}, { full: withD7, ids: 'D7, D6, D5' }), { mustSay: 'D7 is a live ruling of .claude/rules/decisions/other.md, a page, and no statement states it' })
scenario('…cited only in a list of numbers', true, c => withPage(c, { topic: ['- Rule five holds on every screen of the other area [D5].', '- See [D5, D7].'] }, { full: withD7, ids: 'D7, D6, D5' }), { mustSay: 'cited only at .claude/rules/decisions/other.md line' })
scenario('…cited only in a code span (an example, not a citation)', true, c => withPage(c, { topic: ['- Rule five holds on every screen of the other area [D5].', '- A citation written in code, as `[D7]`, is an example only.'] }, { full: withD7, ids: 'D7, D6, D5' }), { mustSay: 'D7 is a live ruling' })
/* the step-1 reader's F1 (7 Nov 26): a ruling is stated on its home page, or — a GENERAL ruling — in an always-loaded
   rules file (plan §2); a scoped area's ruling in an always-loaded file, or on another page, is only pointed to */
scenario('…a scoped area\'s ruling stated only in an always-loaded rules file is not stated (plan §2: only a general ruling may be)', true, c => { withPage(c, {}, { full: withD7, ids: 'D7, D6, D5' }); c.write(RULE_FILE, '# Shipping\n\n- Rule seven holds in every chat, whatever the area [D7].\n') }, { mustSay: 'cited only at .claude/rules/shipping.md line 3, a page or file that may only point to it' })
scenario('…a general ruling stated in an always-loaded rules file instead of the general page', false, c => { c.write(AREA, GENERAL_PAGE.replace('- Rule b holds in every chat, whatever the area [D2].\n', '')); c.write(RULE_FILE, '# Shipping\n\n- Rule b holds in every chat, whatever the area [D2].\n') })
const FOURTH = '.claude/rules/decisions/fourth.md', FOURTH_FULL = '.claude/decisions-full/fourth.md'
const fourthPage = ({ topic = ['- Rule eleven holds on every screen of the fourth area [D11].'], from = ['- General: rule a bears on the fourth area too [D1].'] } = {}) =>
  PAGE_HEAD.replace('src/other/**', 'src/fourth/**').replace('# Other —', '# Fourth —') + ['## The rules', ...topic, '', '## Settled designs, by screen', '- The fourth screen keeps the look it was built with [D11].', '', '## From other areas', ...from, ''].join('\n')
const FOURTH_FULL0 = ['# Rulings — fourth: the full rows', '', '| # | Date | ruling | meaning | home |', '|---|---|---|---|---|', fullRow('D11', 'k', 'this file'), ''].join('\n')
const withFourth = (c, page = fourthPage(), full = FOURTH_FULL0, ids = 'D11') => { c.write(FOURTH, page); c.write(FOURTH_FULL, full); c.edit('DECISIONS.md', t => t.replace('| Archive |', mapRow('Fourth', FOURTH, ids) + '\n| Archive |')) }
const D7in4 = topOf(FOURTH_FULL0, fullRow('D7', 'g', 'this file'))
const point7 = { from: ['- General: rule a bears on the other area too [D1].', '- Fourth: the fourth screen rule bears here too [D7].'] }
scenario('a page\'s ruling pointed to only from another page\'s "From other areas" is not stated (F1)', true, c => { withPage(c, point7); withFourth(c, fourthPage(), D7in4, 'D7, D11') }, { mustSay: 'D7 is a live ruling of .claude/rules/decisions/fourth.md, a page, and no statement states it' })
scenario('…and stated on its own page as well, it passes', false, c => { withPage(c, point7); withFourth(c, fourthPage({ topic: ['- Rule eleven holds on every screen of the fourth area [D11].', '- Rule seven holds on the fourth screens as well [D7].'] }), D7in4, 'D7, D11') })
scenario('a general ruling pointed to only from an area page, the general page not stating it (F1)', true, c => { c.write(AREA, GENERAL_PAGE.replace('- Rule a holds in every chat, whatever the area [D1].\n', '')); withPage(c) }, { mustSay: 'D1 is a live ruling of .claude/rules/decisions/general.md, a page' })
/* the step-1 reader's F2: a line restating a converted area's ruling without the ruling that changed it fails wherever it
   stands — an always-loaded rules file (read in every chat) or another page's pointer — not only on its home page */
scenario('an always-loaded rules file restating a page\'s ruling without its change fails, the page itself right (F2)', true, c => { withPage(c, { topic: ['- Rule five holds on every screen of the other area, on Mondays only [D5, D2].'] }, { full: narrowD5(OTHER_FULL0) }); c.write(RULE_FILE, '# Shipping\n\n- Rule five holds on every screen of the other area, as first ruled [D5].\n') }, { mustSay: '.claude/rules/shipping.md line 3 states D5 but does not cite D2' })
scenario('…the reader\'s shape: the page states only the narrowing, the rules file the ruling as first ruled (F2)', true, c => { withPage(c, { topic: [] }, { full: OTHER_FULL0.replace('| D5 | 21 Sep 26 | e | **Rule e.** e |', '| D5 | 21 Sep 26 | e | **— NARROWED 22 Sep 26 BY D6: only on Mondays.** **Rule e.** e |') }); c.write(RULE_FILE, '# Shipping\n\n- Rule five holds on every day of the week, as first ruled [D5].\n') }, { mustSay: 'states D5 but does not cite D6' })
scenario('another page\'s pointer restating a page\'s ruling without its change fails (F2)', true, c => { withPage(c, point7); withFourth(c, fourthPage({ topic: ['- Rule seven holds on the fourth screens, as rule eleven narrows it [D7, D11].'] }), D7in4.replace('| D7 | 21 Sep 26 | g | **Rule g.** g |', '| D7 | 21 Sep 26 | g | **— NARROWED 22 Sep 26 BY D11: only on Mondays.** **Rule g.** g |'), 'D7, D11') }, { mustSay: '.claude/rules/decisions/other.md line 20 states D7 but does not cite D11' })
/* the step-1 reader's F6: a dash before a number is a range only when the number carries its own D */
scenario('a date after a dash ("D5 – 3 Nov 26") is no range (F6)', false, c => withPage(c, { topic: ['- Rule five holds on every screen of the other area, as ruled D5 – 3 Nov 26 [D5].'] }))
{
  const RLc = await import(pathToFileURL(join(HERE, 'docsize-rulings.mjs')).href)
  for (const [text, want] of [['D1734 – 7 Nov 26', 'D1734'], ['D1500–02', 'D1500'], ['[D5–D7]', 'D5,D6,D7'], ['D654-D656', 'D654,D655,D656']]) {
    const got = [...RLc.citesIn(text).all].sort().join(), ok = got === want; if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'MISS'}  citesIn: "${text}" — expected ${want}, got ${got}`)
  }
}
scenario('a line stating a ruling as it was, beside a separate line citing the ruling that narrowed it (D43 / D755)', true, c => withPage(c, { topic: ['- Rule five holds on every screen of the other area [D5].', '- Rule b bears on the other area on Mondays only [D2].'] }, { full: narrowD5(OTHER_FULL0) }), { mustSay: 'states D5 but does not cite D2' })
scenario('…and with the narrowing cited on the line it narrows, it passes', false, c => withPage(c, { topic: ['- Rule five holds on every screen of the other area, on Mondays only [D5, D2].'] }, { full: narrowD5(OTHER_FULL0) }))
scenario('a page citing a ruling archived as replaced', true, c => withPage(c, { topic: ['- Rule five holds on every screen of the other area [D5].', '- Rule zero holds on the other screen as before [D0].'] }), { mustSay: 'cites D0, which D1 replaced' })
scenario('a page citing a number that is no ruling', true, c => withPage(c, { topic: ['- Rule five holds on every screen of the other area [D5].', '- Rule four hundred holds on the other screen [D400].'] }), { mustSay: 'cites D400, which is no ruling' })
scenario('a range on a page cites each ruling inside it', false, c => withPage(c, { topic: ['- Rules five and six hold on every screen of the other area, settled designs included [D5–D6].'], settled: ['- The other screen keeps the look it was built with, as the rules above say.'] }))
scenario('a page holding a table row', true, c => withPage(c, { topic: ['- Rule five holds on every screen of the other area [D5].', '', '| D6 | 21 Sep 26 | Rule f. |'] }), { mustSay: 'a page holds no table rows' })
scenario('a full row left on a page', true, c => withPage(c, { topic: ['- Rule five holds on every screen of the other area [D5].', '', fullRow('D7', 'g', 'this file')] }, { full: OTHER_FULL0 }), { mustSay: 'a page holds no rows' })
scenario('an area page without its "From other areas" section', true, c => withPage(c, { noFrom: true }), { mustSay: 'no "## From other areas" section' })
scenario('a statement over the cap', true, c => withPage(c, { topic: ['- Rule five holds ' + 'and holds '.repeat(70) + 'on every screen [D5].'] }), { mustSay: 'at most 600' })
scenario('a statement written in capitals', true, c => withPage(c, { topic: ['- RULE FIVE HOLDS ON EVERY SCREEN OF THE OTHER AREA [D5].'] }), { mustSay: 'mostly in capitals' })
scenario('the map of a converted area naming a ruling its full-text file does not hold', true, c => withPage(c, {}, { ids: 'D7, D6, D5' }), { mustSay: 'does not match the files' })
scenario('the map of a converted area missing a ruling of its full-text file', true, c => withPage(c, {}, { ids: 'D6' }), { mustSay: 'does not match the files' })
scenario('the general area converted — loaded in every chat, it needs no Settled or From other areas section', false, c => c.write(AREA, GENERAL_PAGE))
scenario('once the general page converts, an always-loaded rules file stating a ruling without its change fails', true, c => { narrowD1(c); c.write(AREA, GENERAL_PAGE.replace('[D1].', 'on Mondays only [D1, D2].')); c.write(RULE_FILE, '# Shipping\n\n- Rule a holds in every chat, as it was first ruled [D1].\n') }, { mustSay: '.claude/rules/shipping.md line 3 states D1 but does not cite D2' })
scenario('…while the general area is still in short lines, that file is not judged', false, c => { narrowD1(c); c.edit(AREA, t => t.replace(shortRow('D1', 'a'), shortRow('D1', 'a', ' — changed by D2'))); withPage(c); c.write(RULE_FILE, '# Shipping\n\n- Rule a holds in every chat, as it was first ruled [D1].\n') })

/* THE GUIDE AND ITS FULL TEXT (D391): every short form names one ### heading of guide-full.md, every heading is named
   exactly once, its ## sections mirror the guide's, a short form stays within the cap. */
const GUIDE = 'raptor-port/CLAUDE.md', GFULL = 'raptor-port/docs/guide-full.md'
const gPtr = (h, s = `**Rule ${h}.** Do it.`) => `${s} · full text: docs/guide-full.md §${h}`
const guideOf = (...ls) => ['# Guide', '', '## How to work here', '', ...ls, '', '## Where things live', '', '| Need | Go to |', '|---|---|', '| the full text | `docs/guide-full.md` |', ''].join('\n')
const fullOf = (...hs) => ['# Guide — full text', '', '## How to work here', '', ...hs.flatMap(h => [`### ${h}`, '', `The whole text of ${h}.`, '']), ''].join('\n')
const withGuide = (c, g, f) => { c.write(GUIDE, g); if (f !== undefined) c.write(GFULL, f) }
scenario('the guide and its full text, paired', false, c => withGuide(c, guideOf(gPtr('Alpha'), '', '- ' + gPtr('Bravo')), fullOf('Alpha', 'Bravo')))
scenario('a full text no short form names', true, c => withGuide(c, guideOf(gPtr('Alpha')), fullOf('Alpha', 'Bravo')), { mustSay: '§Bravo is named by 0 short forms' })
scenario('a short form pointing to a heading that is not there', true, c => withGuide(c, guideOf(gPtr('Alpha'), '', gPtr('Charlie')), fullOf('Alpha')), { mustSay: 'no such ### heading there' })
scenario('one heading named by two short forms', true, c => withGuide(c, guideOf(gPtr('Alpha'), '', gPtr('Alpha', 'Another rule.')), fullOf('Alpha')), { mustSay: 'named by 2 short forms' })
scenario('a section of the full text the guide does not have', true, c => withGuide(c, guideOf(gPtr('Alpha')), fullOf('Alpha').replace('## How to work here', '## Somewhere else')), { mustSay: 'not a section of' })
scenario('a short form over the cap', true, c => withGuide(c, guideOf(gPtr('Alpha', 'x'.repeat(351))), fullOf('Alpha')), { mustSay: 'at most 350' })
scenario('a pointer typed with its § not at the end of the line', true, c => withGuide(c, guideOf(gPtr('Alpha'), '', 'See docs/guide-full.md §Alpha for more.'), fullOf('Alpha')), { mustSay: 'not typed as a short form' })
scenario('a heading written twice in the full text', true, c => withGuide(c, guideOf(gPtr('Alpha')), fullOf('Alpha', 'Alpha')), { mustSay: 'more than once' })
const bravoUnderMap = fullOf('Alpha') + '## Where things live\n\n### Bravo\n\nThe whole text of Bravo.\n'
scenario('a full text filed under a section other than its short form\'s', true, c => withGuide(c, guideOf(gPtr('Alpha'), '', gPtr('Bravo')), bravoUnderMap), { mustSay: 'file the full text under the section' })
scenario('a full text under its short form\'s own section passes', false, c => withGuide(c, guideOf(gPtr('Alpha')) + '\n' + gPtr('Bravo') + '\n', bravoUnderMap))
scenario('the full text deleted while the guide still points into it', true, c => { withGuide(c, guideOf(gPtr('Alpha')), fullOf('Alpha')); c.commit('guide'); rmSync(join(c.dir, GFULL)) }, { mustSay: 'which is GONE' })


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
scenario('a ruling home DELETED from disk (A5)', true, c => { c.edit(FULL, t => t.replace(fullRow('D2', 'b'), fullRow('D2', 'b', '`docs/home.md`'))); c.commit('point D2 at home'); rmSync(join(c.dir, 'docs/home.md')) }, { mustSay: 'no such file exists' })
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

/* THE RULING MOVER (backlog-archive.mjs --rulings, D137, D390): it converts a new full row, retires a marked one whole,
   refreshes change tails, moves rulings between areas, keeps the map true — and puts every file back when the inventory
   is not clean afterwards. */
const markD1 = mark => c => { c.edit(FULL, t => t.replace('| D1 | 21 Sep 26 | a |', `| D1 | 21 Sep 26 | ${mark} a |`)); c.commit('mark D1') }
mover('--rulings retires a replaced ruling whole and rewrites the map', true, { prep: markD1('**REPLACED BY D2 (21 Sep 26).**'), args: ['--rulings'], check: c =>
  has(c, FULL, '| D1 |') || has(c, AREA, '| D1 |') ? 'D1 is still live'
  : !has(c, 'DECISIONS-ARCHIVE.md', '| D1 | 21 Sep 26 | **REPLACED BY D2 (21 Sep 26).** a | **Rule a.** a | `OUTSTANDING.md` |') ? 'D1 did not arrive whole'
  : !c.read('DECISIONS.md').includes('| always | D0, D1 |') || !c.read('DECISIONS.md').includes('general.md` | always | D2 |') ? 'the map was not rewritten'
  : !/^## Moved /m.test(c.read('DECISIONS-ARCHIVE.md').split('| D0 |')[1]) ? 'no dated heading over the day it moved' : '' })
mover('--rulings leaves a marked example row inside a code block where it is', true, { prep: c => { c.edit(FULL, t => t + '\n~~~md\n| D8 | 21 Sep 26 | **SPENT 21 Sep 26 — an example.** x | x | this file |\n~~~\n'); c.commit('example') }, args: ['--rulings'], check: c =>
  !has(c, FULL, '| D8 |') ? 'the example was moved' : has(c, 'DECISIONS-ARCHIVE.md', '| D8 |') ? 'the example reached the archive' : c.read('DECISIONS.md').includes('D8') ? 'the example reached the map' : '' })
const newFull = (d, meaning) => `| ${d} | 22 Sep 26 | his words | ${meaning} | this file |`
mover('--rulings converts a NEW full row written at the top of its area\'s table', true, { prep: c => c.edit(AREA, t => topOf(t, newFull('D9', '**Nine is the rule.** More detail.'))), args: ['--rulings'], check: c =>
  !c.read(FULL).includes('|---|---|---|---|---|\n' + newFull('D9', '**Nine is the rule.** More detail.') + '\n') ? 'the full row is not at the top of the full-text table, whole'
  : !c.read(AREA).includes('|---|---|---|\n| D9 | 22 Sep 26 | Nine is the rule. |\n') ? 'the short line is not at the top of the area table'
  : !c.read('DECISIONS.md').includes('general.md` | always | D9, D2, D1 |') ? 'the map does not list D9 first' : '' })
mover('--rulings refuses a new row whose heading ends in ":" — and names the fix', false, { prep: c => c.edit(AREA, t => topOf(t, newFull('D9', '**Three things:** one, two, three.'))), args: ['--rulings'], check: (c, r) =>
  !/ends in ":"/.test(r.stderr) ? 'the refusal does not say why' : !has(c, AREA, newFull('D9', '**Three things:** one, two, three.')) ? 'the row moved anyway' : existsSync(join(c.dir, FULL)) && has(c, FULL, '| D9 |') ? 'the full-text file changed' : '' })
mover('--rulings refuses a new row with no bold heading', false, { prep: c => c.edit(AREA, t => topOf(t, newFull('D9', 'No heading at all.'))), args: ['--rulings'], check: (c, r) => /no bold heading/.test(r.stderr) ? '' : 'wrong reason' })
mover('--short-text gives the short line for a row whose heading cannot serve', true, { prep: c => { c.edit(AREA, t => topOf(t, newFull('D9', '**Three things:** one, two, three.'))); c.write('short.tsv', 'D9\tNine means one, two and three.\n') }, args: ['--rulings', '--short-text', 'short.tsv'], check: c =>
  !has(c, AREA, '| D9 | 22 Sep 26 | Nine means one, two and three. |') ? 'the given line was not used' : !has(c, FULL, '**Three things:**') ? 'the full row did not arrive' : '' })
mover('--rulings refreshes a change tail from the full row\'s marks', true, { prep: c => { c.edit(FULL, t => t.replace('| D1 | 21 Sep 26 | a | **Rule a.** a |', '| D1 | 21 Sep 26 | a | **— NARROWED 22 Sep 26 BY D2: only b.** **Rule a.** a |')) }, args: ['--rulings'], check: c =>
  !has(c, AREA, shortRow('D1', 'a', ' — changed by D2')) ? 'the tail was not written' : '' })
mover('--rulings a second time changes nothing', true, { prep: c => { c.edit(AREA, t => topOf(t, newFull('D9', '**Nine is the rule.**'))); const r = spawnSync(process.execPath, ['raptor-port/scripts/backlog-archive.mjs', '--rulings'], { cwd: c.dir, encoding: 'utf8' }); if (r.status !== 0) throw new Error('first run failed: ' + r.stderr); c.commit('converted'); c.snap = [c.read(AREA), c.read(FULL), c.read('DECISIONS.md')] }, args: ['--rulings'], check: c =>
  [c.read(AREA), c.read(FULL), c.read('DECISIONS.md')].join('\0') !== c.snap.join('\0') ? 'the second run changed a file' : '' })
mover('--rulings converts an area file still in the old layout, header and all', true, { prep: c => { c.write(AREA, AREA_OLD); rmSync(join(c.dir, FULL)); c.commit('old layout') }, args: ['--rulings'], check: c =>
  !c.read(AREA).includes('| # | Date | The rule |\n|---|---|---|\n' + shortRow('D2', 'b') + '\n' + shortRow('D1', 'a') + '\n') ? 'the area table is not the short table, in order'
  : !c.read(FULL).includes(fullRow('D2', 'b') + '\n' + fullRow('D1', 'a') + '\n') ? 'the full rows did not arrive whole, in order'
  : !has(c, AREA, 'Also read — nothing yet.') ? 'the prose above the table was lost' : '' })
mover('--rulings --move-rows moves the short line and the full row, and the map follows', true, { prep: c => { c.write(OTHER, OTHER_HEAD); addOther(c, '—'); c.commit('other area') }, args: ['--rulings', '--move-rows', 'D1', '--to', 'other'], check: c =>
  has(c, AREA, '| D1 |') || has(c, FULL, '| D1 |') ? 'D1 is still in general'
  : !has(c, OTHER, shortRow('D1', 'a')) || !has(c, OTHER_FULL, fullRow('D1', 'a')) ? 'D1 did not arrive whole in other'
  : !c.read('DECISIONS.md').includes('other.md` | always | D1 |') ? 'the map does not follow' : '' })
mover('--rulings puts every file back when the inventory is not clean afterwards', false, { prep: c => { c.edit('OUTSTANDING.md', t => cut(t, 'BRAVO')[0]); c.edit(FULL, t => t.replace('| D1 | 21 Sep 26 | a |', '| D1 | 21 Sep 26 | **SPENT 21 Sep 26 — used.** a |')) }, args: ['--rulings'], check: (c, r) =>
  !has(c, FULL, '| D1 |') ? 'D1 was not put back' : has(c, 'DECISIONS-ARCHIVE.md', '| D1 |') ? 'the archive was not put back' : !/put back/.test(r.stderr) ? 'did not say so' : '' })

/* --rulings --merge (D390; Fable and Astra's red team): a real `git merge` between a branch in the OLD layout and one in
   the new, both ways. It starts from the new side, replays the other side's ruling changes three-way, stops on a row both
   sides changed, and prints — never writes — the other side's prose. */
function mergeRulings(name, expectOk, { oldSide, newSide, mergeInto, check }) {
  const ctx = makeRepo()
  const g = (...a) => execFileSync('git', a, { cwd: ctx.dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const run = (...a) => spawnSync(process.execPath, ['raptor-port/scripts/backlog-archive.mjs', ...a], { cwd: ctx.dir, encoding: 'utf8' })
  try {
    ctx.write(AREA, AREA_OLD); rmSync(join(ctx.dir, FULL)); ctx.commit('the old layout — the merge base')
    g('checkout', '-q', '-b', 'old'); oldSide(ctx); ctx.commit('the old-layout branch')
    g('checkout', '-q', 'main'); g('checkout', '-q', '-b', 'slim')
    const conv = run('--rulings'); if (conv.status !== 0) throw new Error('the conversion failed: ' + conv.stderr)
    if (newSide) newSide(ctx, run); ctx.commit('the slim-down')
    g('checkout', '-q', mergeInto === 'old' ? 'old' : 'slim')
    try { g('merge', '-q', '--no-edit', mergeInto === 'old' ? 'slim' : 'old') } catch { /* it stops on conflicts — the case this command is for */ }
    const r = run('--rulings', '--merge')
    const why = r.status === 0 && [AREA, FULL].some(f => /^(<{7}|>{7}|={7})/m.test(ctx.read(f))) ? 'conflict markers left' : check(ctx, r)
    const ok = (r.status === 0) === expectOk && !why
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'MISS'}  merge: ${name} — expected ${expectOk ? 'resolved' : 'stopped'}, got ${r.status === 0 ? 'resolved' : 'stopped'}${why ? ` (${why})` : ''}`)
    if (!ok) console.log((r.stdout + r.stderr).split('\n').map(l => '      ' + l).join('\n'))
  } finally { rmSync(ctx.dir, { recursive: true, force: true }) }
}
const D9row = newFull('D9', '**Nine is the rule.** Filed on the old branch.')
const D2edit = fullRow('D2', 'b').replace('**Rule b.** b', '**Rule b.** b, edited on the old branch')
const parallel = c => { c.edit(AREA, t => topOf(t, D9row).replace(fullRow('D2', 'b'), D2edit).replace('Also read — nothing yet.', 'Also read — D5, added on the old branch.')); setMap(c, AREA, 'D9, D2, D1') }
const slimMarksD1 = (c, run) => { c.edit(FULL, t => t.replace('| D1 | 21 Sep 26 | a | **Rule a.** a |', '| D1 | 21 Sep 26 | a | **— NARROWED 22 Sep 26 BY D2: only b.** **Rule a.** a |')); const r = run('--rulings'); if (r.status !== 0) throw new Error(r.stderr) }
const resolvedWell = (c, r) =>
  !c.read(AREA).includes('|---|---|---|\n| D9 | 22 Sep 26 | Nine is the rule. |\n') ? 'D9 was not converted to the top of the short table'
  : !has(c, FULL, D9row) ? 'D9\'s full row did not arrive whole'
  : !has(c, FULL, D2edit) ? 'the old branch\'s one-sided edit of D2 was lost'
  : !has(c, FULL, '**— NARROWED 22 Sep 26 BY D2: only b.**') || !has(c, AREA, shortRow('D1', 'a', ' — changed by D2')) ? 'the slim side\'s mark on D1 was lost'
  : has(c, AREA, 'added on the old branch') ? 'the old branch\'s prose was written — it must only be printed'
  : !/RE-APPLY BY HAND[\s\S]*added on the old branch/.test(r.stdout) ? 'the old branch\'s prose change was not printed'
  : !/UNREAD[\s\S]*D9/.test(r.stdout) ? 'the made short line was not listed UNREAD' : ''
mergeRulings('the old-layout branch merges the slim-down in (new rows, a one-sided edit, prose)', true, { oldSide: parallel, newSide: slimMarksD1, mergeInto: 'old', check: resolvedWell })
mergeRulings('the slim-down merges the old-layout branch in — the same result', true, { oldSide: parallel, newSide: slimMarksD1, mergeInto: 'slim', check: resolvedWell })
mergeRulings('a row both sides changed stops the command, naming it', false, { oldSide: c => c.edit(AREA, t => t.replace(fullRow('D2', 'b'), D2edit)), newSide: c => c.edit(FULL, t => t.replace('**Rule b.** b |', '**Rule b.** b, edited on the slim side |')), mergeInto: 'old', check: (c, r) => /D2 had its row changed on both sides/.test(r.stderr) ? '' : 'it did not name D2' })
mergeRulings('a ruling retired on the old branch stays retired', true, { oldSide: c => { c.edit(AREA, t => dropD(t, 'D1')); c.edit('DECISIONS-ARCHIVE.md', t => t + '\n' + fullRow('D1', 'a').replace('| a |', '| **SPENT 22 Sep 26 — used.** a |') + '\n'); setMap(c, AREA, 'D2'); setMap(c, 'DECISIONS-ARCHIVE.md', 'D0, D1') }, mergeInto: 'old', check: c =>
  has(c, AREA, '| D1 |') || has(c, FULL, '| D1 |') ? 'D1 is live again' : !has(c, 'DECISIONS-ARCHIVE.md', '**SPENT 22 Sep 26 — used.**') ? 'D1 is not in the archive' : '' })


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
const NOW = (...bs) => ['# HANDOFF', '', '## Now', '', ...bs.flatMap(b => [`<!-- now:${b} -->`, `### ${b}`, 'where it stands', '<!-- /now -->', '']), '## Next, in order', '', '## Gate baseline', ''].join('\n')
scenario('two ## Now blocks for one branch', true, c => c.write('HANDOFF.md', NOW('claude/x', 'claude/x')), { mustSay: '## Now blocks for claude/x' })
scenario('one ## Now block per branch', false, c => c.write('HANDOFF.md', NOW('claude/x', 'claude/y')))
/* HANDOFF.md's SHAPE ([HANDOFF-SHAPE-GUARD]): the 25 Sep 26 span replace (119dff45, on claude/request-one-row) ate a
   block's last lines, its end marker, the whole ## Next, in order and the ## Gate baseline heading, and the gate passed
   it into main. Replayed here; each cousin fails by name; a block rewritten, added or removed whole passes; damage the
   base already had is reported, not failed. */
scenario('HANDOFF.md: the 25 Sep 26 span replace, from a Gates line to the gate counts', true, c => c.edit('HANDOFF.md', t => t.replace(/- \*\*Gates:\*\* green[\s\S]*The counts\./, '- **Gates:** green · the counts')), { mustSay: 'HANDOFF.md has lost its shape: the ## Now block for claude/b has no <!-- /now -->' })
scenario('HANDOFF.md: a block\'s end marker lost before the next block', true, c => c.edit('HANDOFF.md', t => t.replace('- a line\n<!-- /now -->\n', '- a line\n')), { mustSay: 'no <!-- /now --> before the next block (claude/b)' })
scenario('HANDOFF.md: a heading lost', true, c => c.edit('HANDOFF.md', t => t.replace('## Gate baseline\n', '')), { mustSay: '"## Gate baseline" appears 0 times' })
scenario('HANDOFF.md: a heading doubled', true, c => c.edit('HANDOFF.md', t => t + '\n## Next, in order\n'), { mustSay: '"## Next, in order" appears 2 times' })
scenario('HANDOFF.md: headings out of order', true, c => c.edit('HANDOFF.md', t => t.replace('## Next, in order\n\n1. the order\n\n## Gate baseline\n\nThe counts.\n', '## Gate baseline\n\nThe counts.\n\n## Next, in order\n\n1. the order\n')), { mustSay: 'out of order' })
scenario('HANDOFF.md: a block written below ## Next, in order', true, c => c.edit('HANDOFF.md', t => t.replace('1. the order\n', '1. the order\n\n<!-- now:claude/c -->\n### c\n<!-- /now -->\n')), { mustSay: 'the block for claude/c sits outside ## Now' })
scenario('HANDOFF.md: an opening marker lost, its end marker left', true, c => c.edit('HANDOFF.md', t => t.replace('<!-- now:claude/a -->\n', '')), { mustSay: 'closes no block' })
scenario('HANDOFF.md: deleted', true, c => rmSync(join(c.dir, 'HANDOFF.md')), { mustSay: 'HANDOFF.md is GONE' })
scenario('HANDOFF.md: a block rewritten, one added, one removed whole', false, c => c.edit('HANDOFF.md', t => t.replace('- b line\n', '- b line, rewritten\n- and a second line\n').replace(/<!-- now:claude\/a -->[\s\S]*?<!-- \/now -->\n\n/, '').replace('## Next, in order', '<!-- now:claude/d -->\n### `claude/d` — new\n- d line\n<!-- /now -->\n\n## Next, in order')))
scenario('HANDOFF.md: an example marker inside a code block is not a block', false, c => c.edit('HANDOFF.md', t => t.replace('- b line\n', '- b line\n~~~md\n<!-- now:claude/example -->\n## Next, in order\n~~~\n')))
scenario('HANDOFF.md: damage already at the base is reported, not failed', false, c => { c.edit('HANDOFF.md', t => t.replace('- a line\n<!-- /now -->\n', '- a line\n')); c.commit('an older break, already on main') }, { base: 'HEAD', mustSay: '(already so at the base)' })
/* THE SKILL LOG'S NOTE NUMBERS ([MERGE-ONCE-RECORDS] part 1, 8 Nov 26): two branches each give their next note the same
   number; a merge that ends without a clash (or a hand merge that forgot the renumber) put both on main unseen. Each number
   heads one entry, across the log and its archive folder. */
const SKLOG = '.claude/skill-observations/log.md', SKARCH = '.claude/skill-observations/archive/log-2026-10-27.md'
const obs = (n, t) => `### Observation ${n}: ${t}\n\nthe note's body\n\n`
const SKLOG0 = '# Skill Observation Log\n\n' + obs(7, 'seven') + obs(8, 'eight')
scenario('skill log: every note number once', false, c => { c.write(SKLOG, SKLOG0); c.write(SKARCH, '# archive\n\n' + obs(3, 'three')) })
scenario('skill log: one number heading two notes', true, c => c.write(SKLOG, SKLOG0 + obs(8, 'a different eight')), { mustSay: 'Observation 8 heads 2 entries' })
scenario('skill log: a live number that also heads an archived note', true, c => { c.write(SKLOG, SKLOG0); c.write(SKARCH, '# archive\n\n' + obs(7, 'an older seven')) }, { mustSay: 'Observation 7 heads an entry in the log and one in .claude/skill-observations/archive/log-2026-10-27.md' })
scenario('a new top-level reference doc that no map names', true, c => c.write('raptor-port/docs/newref.md', '# new\n'), { mustSay: 'no map names' })
scenario('a new top-level reference doc on the map', false, c => { c.write('raptor-port/docs/newref.md', '# new\n'); c.write('raptor-port/CLAUDE.md', '| the new reference | `docs/newref.md` |\n') })
scenario('a design for one task, under superpowers/ (tier 3, no map needed)', false, c => c.write('raptor-port/docs/superpowers/specs/2026-09-24-x.md', '# x\n'))
scenario('over a ceiling says it is a tripwire, not a target (D141)', true, c => c.edit('OUTSTANDING.md', t => t + 'x\n'.repeat(3000)), { mustSay: 'TRIPWIRE' })   // 3000: well past the backlog's tripwire (2150 since 7 Oct 26, D609; at 1400, and again at 2000, this stopped crossing it when the tripwire rose — keep it well above the marker in docsize.mjs)
scenario('a new area rulings file with no paths: (it would load in every chat)', true, c => c.write(OTHER, '# Rulings — other\n'), { mustSay: 'loads in EVERY chat' })
/* THE SEAM FILES (D1735; the rules-diet plan §2): registered with a file inside the area and one on its seam — a seam file
   loads on both, its area file no longer on the seam, and a seam file nobody registered fails */
const LW_SEAM = '.claude/rules/seams/leave-war.md', LW_AREA = '.claude/rules/decisions/leave-war.md'
const RLs = await import(pathToFileURL(join(HERE, 'docsize-rulings.mjs')).href), LW_SEAMS = RLs.SEAMS[0].seams
const seamFile = (...globs) => `---\npaths:\n${globs.map(g => `  - ${g}`).join('\n')}\n---\n\n# The Leave War — its architecture\n\nMoved whole from its area file.\n`
scenario('a seam file loading inside its area and on its seam', false, c => c.write(LW_SEAM, seamFile('raptor-port/src/leavewar/**', '# where it meets the rest of the app', ...LW_SEAMS)))
scenario('a seam file that misses its seam', true, c => c.write(LW_SEAM, seamFile('raptor-port/src/leavewar/**')), { mustSay: 'does not load on raptor-port/src/ui/InputsPage.tsx, a path of its seam' })
/* the step-1 reader's questions 1 and 2: every seam path is checked, not one probe; a seam file gone while its area no
   longer loads on its seam fails */
scenario('a seam file missing one seam path the old probe did not use', true, c => c.write(LW_SEAM, seamFile('raptor-port/src/leavewar/**', ...LW_SEAMS.filter(g => !g.endsWith('engine/inputs.ts')))), { mustSay: 'does not load on raptor-port/src/engine/inputs.ts, a path of its seam' })
scenario('an area file still loading on a seam path the old probe did not use', true, c => { c.write(LW_SEAM, seamFile('raptor-port/src/leavewar/**', ...LW_SEAMS)); c.write(LW_AREA, seamFile('raptor-port/src/leavewar/**', 'raptor-port/src/ui/QualsPage.tsx').replace('its architecture', 'rulings')) }, { mustSay: 'still loads on raptor-port/src/ui/QualsPage.tsx' })
scenario('a seam file missing one of its area file\'s own paths', true, c => { c.write(LW_SEAM, seamFile('raptor-port/src/leavewar/**', ...LW_SEAMS)); c.write(LW_AREA, seamFile('raptor-port/src/leavewar/**', 'raptor-port/docs/leavewar/**').replace('its architecture', 'rulings')) }, { mustSay: 'does not load on raptor-port/docs/leavewar/**, a path of its area file' })
scenario('a seam file gone once its area file no longer loads on its seam', true, c => c.write(LW_AREA, seamFile('raptor-port/src/leavewar/**').replace('its architecture', 'rulings')), { mustSay: '.claude/rules/seams/leave-war.md is missing' })
{ /* …but no seam file while the area file still loads on every seam path (today) — read directly: an area file written
     into the test repo would fail the gate's other checks (its map row, its tripwire), not the seam check */
  const area = seamFile('raptor-port/src/leavewar/**', ...LW_SEAMS).replace('its architecture', 'rulings')
  const got = RLs.seamProblems([], f => (f === LW_AREA ? area : '')), ok = !got.length; if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'MISS'}  …but no seam file while the area file still loads on every seam path (today)${ok ? '' : ` — got: ${got[0]}`}`)
}
scenario('a seam file that misses its own area', true, c => c.write(LW_SEAM, seamFile('raptor-port/src/ui/InputsPage.tsx')), { mustSay: 'a file inside its area' })
scenario('a seam file whose area file still loads on the seam', true, c => { c.write(LW_SEAM, seamFile('raptor-port/src/leavewar/**', 'raptor-port/src/ui/InputsPage.tsx')); c.write(LW_AREA, seamFile('raptor-port/src/leavewar/**', 'raptor-port/src/ui/InputsPage.tsx').replace('its architecture', 'rulings')) }, { mustSay: 'still loads on raptor-port/src/ui/InputsPage.tsx' })
scenario('a seam file nobody registered', true, c => c.write('.claude/rules/seams/other.md', seamFile('raptor-port/src/other/**')), { mustSay: 'a seam file nobody registered' })
{ /* the paths: matcher, read directly — the globs the rules files use today */
  const RLp = await import(pathToFileURL(join(HERE, 'docsize-rulings.mjs')).href)
  const cases = [
    ['** at the end takes any depth', ['raptor-port/src/**'], 'raptor-port/src/leavewar/ui/Matrix.tsx', true],
    ['…but not a sibling folder', ['raptor-port/src/**'], 'raptor-port/srcx/a.ts', false],
    ['* stays inside one name', ['raptor-port/src/ui/Input*.tsx'], 'raptor-port/src/ui/InputsPage.tsx', true],
    ['…never across a folder', ['raptor-port/src/ui/Input*.tsx'], 'raptor-port/src/ui/Inputs/x.tsx', false],
    ['**/ in the middle, then a name pattern, then /**', ['raptor-port/docs/**/*lw-*/**'], 'raptor-port/docs/img/handpass/2026-x-lw-a/b.png', true],
    ['**/ matches no folder at all', ['raptor-port/src/**/*Oil*'], 'raptor-port/src/OilDayList.tsx', true],
    ['a dot is a dot, not any letter', ['raptor-port/src/*.ts*'], 'raptor-port/src/mainxts', false],
    ['paths: read from frontmatter, a comment line skipped', RLp.pathsOf(seamFile('a/**', '# a comment', 'b/c.ts')), 'b/c.ts', true],
  ]
  for (const [name, globs, file, want] of cases) { const got = RLp.matchesPaths(globs, file), ok = got === want; if (!ok) failed++; console.log(`${ok ? 'PASS' : 'MISS'}  paths: ${name} — expected ${want}, got ${got}`) }
}

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

/* ---- The final code reads of the slim-down (Fable and Astra, 28 Sep 26): one case per finding ---- */
scenario('a short line holding an escaped "\\|" fails', true, c => c.edit(AREA, t => t.replace(shortRow('D1', 'a'), '| D1 | 21 Sep 26 | Rule a \\| b. |')), { mustSay: 'holds a "|"' })
scenario('a short line hiding a second change tail inside its text fails', true, c => { narrowD1(c); c.edit(AREA, t => t.replace(shortRow('D1', 'a'), '| D1 | 21 Sep 26 | Rule a — changed by D999 — changed by D2 |')) }, { mustSay: 'inside its text' })
scenario('a dated, dashed retire mark left live is caught', true, c => c.edit(FULL, t => t.replace('| D1 | 21 Sep 26 | a |', '| D1 | 21 Sep 26 | **— REPLACED 22 Sep 26 BY D2: b instead.** a |')), { mustSay: 'marked replaced/spent' })
mover('--rulings retires a row with the dated, dashed retire mark', true, { prep: markD1('**— REPLACED 22 Sep 26 BY D2: b instead.**'), args: ['--rulings'], check: c => has(c, FULL, '| D1 |') || !has(c, 'DECISIONS-ARCHIVE.md', '**— REPLACED 22 Sep 26 BY D2: b instead.** a') ? 'D1 was not retired whole' : '' })
mover('--short-text refuses an empty line', false, { prep: c => { c.edit(AREA, t => topOf(t, newFull('D9', '**Three things:** x.'))); c.write('short.tsv', 'D9\t   \n') }, args: ['--rulings', '--short-text', 'short.tsv'], check: (c, r) => /is empty/.test(r.stderr) ? '' : 'wrong reason' })
const archD0text = '| D0 | 20 Sep 26 | z | z | `OUTSTANDING.md` |'
mover('a NEW row under a number the archive holds is refused, never dropped (Fable F1)', false, { prep: c => c.edit(AREA, t => topOf(t, newFull('D0', '**A new rule reusing zero.**'))), args: ['--rulings'], check: (c, r) =>
  !/never reused/.test(r.stderr) ? 'the refusal does not say why' : !has(c, AREA, '**A new rule reusing zero.**') ? 'the new row was dropped' : '' })
mover('a live copy of a retired ruling (the same text) is dropped, not archived twice (Fable F7)', true, { prep: c => { c.edit(FULL, t => topOf(t, archD0text.replace('**REPLACED BY D1 (21 Sep 26).** ', ''))); c.edit(AREA, t => topOf(t, '| D0 | 20 Sep 26 | Rule z. |')) }, args: ['--rulings'], check: c =>
  has(c, FULL, '| D0 |') || has(c, AREA, '| D0 |') ? 'the live copy stayed' : c.read('DECISIONS-ARCHIVE.md').split('| D0 |').length !== 2 ? 'D0 is in the archive other than once' : '' })
mover('an old-layout file holding a marked row converts in ONE run — a second changes nothing (Fable F11)', true, { prep: c => { c.write(AREA, AREA_OLD.replace('| D1 | 21 Sep 26 | a |', '| D1 | 21 Sep 26 | **SPENT 22 Sep 26 — used.** a |')); rmSync(join(c.dir, FULL)); setMap(c, 'DECISIONS-ARCHIVE.md', 'D0'); c.commit('old layout, one row spent') }, args: ['--rulings'], check: c => {
  if (!c.read(AREA).includes('| # | Date | The rule |')) return 'the header was not rewritten in the first run'
  const snap = [c.read(AREA), c.read(FULL)].join('\0'); const r = spawnSync(process.execPath, ['raptor-port/scripts/backlog-archive.mjs', '--rulings'], { cwd: c.dir, encoding: 'utf8' })
  return r.status !== 0 ? 'the second run failed' : [c.read(AREA), c.read(FULL)].join('\0') !== snap ? 'the second run changed a file' : '' } })
mover('--rulings: the SECOND write failing puts every file back and removes what it created (Astra 5)', false, { prep: c => { c.write(AREA, AREA_OLD); rmSync(join(c.dir, FULL)); c.commit('old layout'); c.snap = [c.read(AREA), c.read('DECISIONS.md')]; c.write('fail-second-rename.mjs', FAIL_SECOND_RENAME) }, node: c => ['--import', pathToFileURL(join(c.dir, 'fail-second-rename.mjs')).href], args: ['--rulings'], check: (c, r) =>
  [c.read(AREA), c.read('DECISIONS.md')].join('\0') !== c.snap.join('\0') ? 'a file was not put back' : existsSync(join(c.dir, FULL)) ? 'the full-text file it created is still there' : existsSync(join(c.dir, AREA) + '.docmove-tmp') ? 'a temporary copy was left' : !/put back/.test(r.stderr) ? 'did not say so' : '' })
mover('--rulings refuses a rulings file that mixes line endings (Fable F6)', false, { prep: c => c.edit(AREA, t => t.replace(shortRow('D1', 'a') + '\n', shortRow('D1', 'a') + '\r\n')), args: ['--rulings'], check: (c, r) => /mixes CRLF and LF/.test(r.stderr) ? '' : 'wrong reason' })
mover('--rulings refuses an area file with no byte tripwire, before writing', false, { prep: c => { c.write('.claude/rules/decisions/third.md', OTHER_HEAD.replace('other', 'third') + newFull('D9', '**Nine.**') + '\n'); c.edit('DECISIONS.md', t => t.replace('| Archive |', mapRow('Third', '.claude/rules/decisions/third.md', 'D9') + '\n| Archive |')) }, args: ['--rulings'], check: (c, r) =>
  !/no byte tripwire/.test(r.stderr) ? 'wrong reason' : existsSync(join(c.dir, '.claude/decisions-full/third.md')) ? 'it wrote anyway' : '' })
mover('--move-rows of several rows sharing a date keeps their order', true, { prep: c => { c.write(OTHER, OTHER_HEAD); addOther(c, '—'); c.commit('other area') }, args: ['--rulings', '--move-rows', 'D1,D2', '--to', 'other'], check: c =>
  !c.read(OTHER).includes(shortRow('D2', 'b') + '\n' + shortRow('D1', 'a')) ? 'the short lines are out of order' : !c.read(OTHER_FULL).includes(fullRow('D2', 'b') + '\n' + fullRow('D1', 'a')) ? 'the full rows are out of order' : '' })
/* THE RECORDER ON A PAGE (owner, D1735 — the rules diet's step 1, part 2; plan §3, §5): the area `other` converted to a
   page beside `general` still in short lines, as while the areas convert one at a time. Recording, a change mark,
   retiring and a renumbered clash in the page shape; --move-rows each way. Each edit owed is named and nothing written. */
const p5 = '- Rule five holds on every screen of the other area [D5].'
const D7full = newFull('D7', '**Seven is the rule.**')
const fullWith = (...rows) => rows.reduce((t, r) => topOf(t, r), OTHER_FULL0)
const nothingWritten = c => c.read('DECISIONS.md') !== c.snap ? 'it wrote anyway' : ''
mover('page: a ruling written in its full-text file and stated on the page is recorded — no short line, the map from the full-text file — beside a short-line area\'s new row', true, { prep: c => { withPage(c, { topic: [p5, '- Rule seven holds on the other screens as well [D7].'] }, { full: fullWith(D7full) }); c.edit(AREA, t => topOf(t, newFull('D9', '**Nine is the rule.**'))) }, args: ['--rulings'], check: c =>
  has(c, OTHER, '| D7 |') ? 'a short line was written on the page' : !c.read(OTHER_FULL).includes('|---|---|---|---|---|\n' + D7full + '\n') ? 'the full row moved'
  : !c.read('DECISIONS.md').includes('other.md` | always | D7, D6, D5 |') ? 'the map does not list the full-text file\'s rulings' : !has(c, AREA, '| D9 | 22 Sep 26 | Nine is the rule. |') ? 'the short-line area was not converted as before' : '' })
mover('page: a ruling the page does not state yet is refused, naming the page and its sections — nothing written', false, { prep: c => { withPage(c, {}, { full: fullWith(D7full) }); c.commit('page'); c.snap = c.read('DECISIONS.md') }, args: ['--rulings'], check: (c, r) =>
  !/D7 \("Seven is the rule\."\): no line of \.claude\/rules\/decisions\/other\.md states it/.test(r.stdout) || !/The rules · Settled designs, by screen · From other areas/.test(r.stdout) ? 'the page and its sections were not named' : !/nothing written/.test(r.stderr) ? 'it did not say nothing was written' : nothingWritten(c) })
mover('page: a full row left on the page moves whole to the top of its full-text table', true, { prep: c => withPage(c, { topic: [p5, '- Rule seven holds on the other screens as well [D7].', '', D7full] }), args: ['--rulings'], check: c =>
  has(c, OTHER, '| D7 |') ? 'the row stayed on the page' : !c.read(OTHER_FULL).includes('|---|---|---|---|---|\n' + D7full + '\n') ? 'the full row did not arrive at the top, whole' : !c.read('DECISIONS.md').includes('other.md` | always | D7, D6, D5 |') ? 'the map does not follow' : '' })
const D5byD7 = fullWith(D7full).replace('| D5 | 21 Sep 26 | e | **Rule e.** e |', '| D5 | 21 Sep 26 | e | **— NARROWED 22 Sep 26 BY D7: only on Mondays.** **Rule e.** e |')
mover('page: a change mark — the line stating the older ruling without the newer is refused, naming its line and section', false, { prep: c => { withPage(c, { topic: [p5, '- Rule seven holds on the other screens as well [D7].'] }, { full: D5byD7 }); c.commit('page'); c.snap = c.read('DECISIONS.md') }, args: ['--rulings'], check: (c, r) =>
  !/other\.md line \d+ \(## The rules\) states D5: cite D7 on it too/.test(r.stdout) ? 'the line to rewrite was not named' : nothingWritten(c) })
mover('…and with the line rewritten to cite both, it is recorded', true, { prep: c => withPage(c, { topic: ['- Rule five holds on every screen of the other area, on Mondays only [D5, D7].'] }, { full: D5byD7 }), args: ['--rulings'], check: c => !c.read('DECISIONS.md').includes('other.md` | always | D7, D6, D5 |') ? 'the map does not list D7' : '' })
const D6out = OTHER_FULL0.replace('| D6 | 21 Sep 26 | f |', '| D6 | 21 Sep 26 | **REPLACED BY D5 (22 Sep 26).** f |')
mover('page: retiring a ruling the page still cites is refused, naming the stale line', false, { prep: c => { withPage(c, {}, { full: D6out }); c.commit('page'); c.snap = c.read('DECISIONS.md') }, args: ['--rulings'], check: (c, r) =>
  !/other\.md line \d+ \(## Settled designs, by screen\) cites D6, which D5 replaced/.test(r.stdout) ? 'the stale line was not named' : has(c, 'DECISIONS-ARCHIVE.md', '| D6 |') ? 'D6 reached the archive' : nothingWritten(c) })
mover('…and with the line rewritten, it retires whole and the map follows', true, { prep: c => withPage(c, { settled: ['- The other screen keeps the look rule five gives it [D5].'] }, { full: D6out }), args: ['--rulings'], check: c =>
  has(c, OTHER_FULL, '| D6 |') ? 'D6 is still live' : !has(c, 'DECISIONS-ARCHIVE.md', '**REPLACED BY D5 (22 Sep 26).** f') ? 'D6 did not arrive whole in the archive' : !c.read('DECISIONS.md').includes('other.md` | always | D5 |') ? 'the map does not follow' : '' })
mover('page: a new full row under a number the archive holds is refused, never reused', false, { prep: c => withPage(c, { topic: [p5, '- Rule zero holds again on the other screens [D0].'] }, { full: fullWith('| D0 | 22 Sep 26 | **A brand-new instruction.** z | z | this file |') }), args: ['--rulings'], check: (c, r) => /never reused/.test(r.stderr) ? '' : 'it was not refused as a reused number' })
mover('page: renumbered on a clash — the page still citing the old number is refused, naming it', false, { prep: c => { withPage(c, { topic: [p5, '- Rule nine holds on the other screens as well [D9].'] }, { full: fullWith(newFull('D10', '**Ten, filed as nine on the other branch.**')) }); c.commit('page'); c.snap = c.read('DECISIONS.md') }, args: ['--rulings'], check: (c, r) =>
  !/cites D9, which is no ruling/.test(r.stdout) || !/D10 \("Ten/.test(r.stdout) ? 'the old number and the unstated new one were not both named' : nothingWritten(c) })
mover('--move-rows from a short-line area into a page: the short line dropped, the full row moved, the page stating it', true, { prep: c => { withPage(c); c.commit('page') }, args: ['--rulings', '--move-rows', 'D1', '--to', 'other'], check: c =>
  has(c, AREA, '| D1 |') || has(c, FULL, '| D1 |') ? 'D1 is still in general' : has(c, OTHER, '| D1 |') ? 'a short line was written on the page' : !has(c, OTHER_FULL, fullRow('D1', 'a')) ? 'the full row did not arrive whole'
  : !c.read('DECISIONS.md').includes('other.md` | always | D6, D5, D1 |') || !c.read('DECISIONS.md').includes('general.md` | always | D2 |') ? 'the map does not follow' : '' })
/* the step-1 reader's F1, the recorder's route: a ruling moved from one page to another that does not state it */
const pages7 = c => { withPage(c, { topic: [p5, '- Rule seven holds on the other screens as well [D7].'] }, { full: fullWith(D7full), ids: 'D7, D6, D5' }); withFourth(c); c.commit('two pages'); c.snap = c.read('DECISIONS.md') }
mover('--move-rows from a page to another page that does not state it is refused — the old page\'s line only points (F1)', false, { prep: pages7, args: ['--rulings', '--move-rows', 'D7', '--to', 'fourth'], check: (c, r) =>
  !/D7 \("Seven is the rule\."\): no line of \.claude\/rules\/decisions\/fourth\.md states it/.test(r.stdout) ? 'the page that must state it was not named' : has(c, OTHER_FULL, '| D7 |') ? nothingWritten(c) || '' : 'D7 left its full-text file' })
mover('…and with the new page stating it, the move is made and the old page\'s line printed to move', true, { prep: c => { pages7(c); c.write(FOURTH, fourthPage({ topic: ['- Rule eleven holds on every screen of the fourth area [D11].', '- Rule seven holds on the fourth screens as well [D7].'] })) }, args: ['--rulings', '--move-rows', 'D7', '--to', 'fourth'], check: (c, r) =>
  has(c, OTHER_FULL, '| D7 |') || !has(c, FOURTH_FULL, '| D7 |') ? 'D7 did not move' : !/MOVE ON THE PAGES[\s\S]*other\.md line \d+ \(## The rules\) states D7, now of fourth\.md/.test(r.stdout) ? 'the old page\'s line was not printed to move' : '' })
mover('--move-rows out of a page: a short line made from its heading, the page line that states it printed to move', true, { prep: c => { withPage(c); c.commit('page') }, args: ['--rulings', '--move-rows', 'D5', '--to', 'general'], check: (c, r) =>
  has(c, OTHER_FULL, '| D5 |') ? 'D5 is still in other' : !has(c, AREA, '| D5 | 21 Sep 26 | Rule e. |') || !has(c, FULL, fullRow('D5', 'e', 'this file')) ? 'the short line and the full row did not arrive in general'
  : !/MOVE ON THE PAGES[\s\S]*other\.md line \d+ \(## The rules\) states D5, now of general\.md/.test(r.stdout) ? 'the page line was not printed to move' : !/UNREAD[\s\S]*\| D5 \|/.test(r.stdout) ? 'the made short line was not listed UNREAD' : '' })
/* Astra 4: an unusable DOCSGUARD_BASE fell back to HEAD~1 and missed a ruling dropped two commits back */
{
  const ctx = makeRepo(), g = (...a) => execFileSync('git', a, { cwd: ctx.dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  try {
    g('checkout', '-q', '-b', 'feature'); addBoth(ctx, 'D9', 'z'); ctx.commit('file D9')
    ctx.edit(FULL, t => dropD(t, 'D9')); ctx.edit(AREA, t => dropD(t, 'D9')); setMap(ctx, AREA, 'D2, D1'); ctx.commit('drop D9')
    ctx.edit('docs/home.md', t => t + 'unrelated\n'); ctx.commit('unrelated')
    const r = spawnSync(process.execPath, ['raptor-port/scripts/docsize.mjs'], { cwd: ctx.dir, encoding: 'utf8', env: { ...process.env, DOCSGUARD_BASE: 'not-a-commit', DOCSGUARD_ALLOW: '' } })
    const ok = r.status !== 0 && (r.stdout + r.stderr).includes('D9 is GONE')
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'MISS'}  an unusable DOCSGUARD_BASE still catches a ruling dropped two commits back (Astra 4)`)
  } finally { rmSync(ctx.dir, { recursive: true, force: true }) }
}

/* --merge, the code reads' cases: a general git scenario (the base in the new layout unless it says otherwise) */
function gitRulings(name, expectOk, build, check) {
  const ctx = makeRepo()
  const g = (...a) => execFileSync('git', a, { cwd: ctx.dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const run = (...a) => spawnSync(process.execPath, ['raptor-port/scripts/backlog-archive.mjs', ...a], { cwd: ctx.dir, encoding: 'utf8' })
  try {
    const r = build(ctx, g, run)
    const why = check(ctx, r)
    const ok = (r.status === 0) === expectOk && !why
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'MISS'}  merge: ${name} — expected ${expectOk ? 'resolved' : 'stopped'}, got ${r.status === 0 ? 'resolved' : 'stopped'}${why ? ` (${why})` : ''}`)
    if (!ok) console.log((r.stdout + r.stderr).split('\n').map(l => '      ' + l).join('\n'))
  } finally { rmSync(ctx.dir, { recursive: true, force: true }) }
}
const mergeIn = (g, into, from) => { g('checkout', '-q', into); try { g('merge', '-q', '--no-commit', '--no-ff', from) } catch { /* stops on conflicts */ } }
gitRulings('no merge in progress is refused', false, (c, g, run) => run('--rulings', '--merge'), (c, r) => /no MERGE_HEAD/.test(r.stderr) ? '' : 'wrong reason')
gitRulings('another conflicted file must be resolved first', false, (c, g, run) => {
  g('checkout', '-q', '-b', 'a'); c.edit('OUTSTANDING.md', t => t.replace('Line 1 of ALPHA', 'Line 1 of ALPHA, a')); c.commit('a')
  g('checkout', '-q', 'main'); c.edit('OUTSTANDING.md', t => t.replace('Line 1 of ALPHA', 'Line 1 of ALPHA, main')); c.commit('main')
  mergeIn(g, 'a', 'main'); return run('--rulings', '--merge') }, (c, r) => /resolve the other conflicted files first/.test(r.stderr) ? '' : 'wrong reason')
gitRulings('a D-number filed on both sides with different text stops', false, (c, g, run) => {
  g('checkout', '-q', '-b', 'a'); c.edit(AREA, t => topOf(t, newFull('D9', '**Nine, from a.**'))); run('--rulings'); c.commit('a')
  g('checkout', '-q', 'main'); c.edit(AREA, t => topOf(t, newFull('D9', '**Nine, from main.**'))); run('--rulings'); c.commit('main')
  mergeIn(g, 'a', 'main'); return run('--rulings', '--merge') }, (c, r) => /D9 was filed on both sides/.test(r.stderr) ? '' : 'it did not name the clash')
gitRulings('a ruling moved to different areas on the two sides stops', false, (c, g, run) => {
  c.write(OTHER, OTHER_HEAD); c.write('.claude/rules/decisions/third.md', OTHER_HEAD.replace('other', 'third')); addOther(c, '—')
  c.edit('DECISIONS.md', t => t.replace('| Archive |', mapRow('Third', '.claude/rules/decisions/third.md', '—') + '\n| Archive |'))
  c.edit('raptor-port/scripts/docsize.mjs', t => t.replace('const RULING_BYTES = [\n', "const RULING_BYTES = [\n  ['.claude/rules/decisions/third.md', 2, 6000],\n")); c.commit('two more areas')
  g('checkout', '-q', '-b', 'a'); run('--rulings', '--move-rows', 'D1', '--to', 'other'); c.commit('a moves D1')
  g('checkout', '-q', 'main'); run('--rulings', '--move-rows', 'D1', '--to', 'third'); c.commit('main moves D1')
  mergeIn(g, 'a', 'main'); return run('--rulings', '--merge') }, (c, r) => /moved to different areas/.test(r.stderr) ? '' : 'it did not name the divergent move')
gitRulings('both sides in the new layout: the other side\'s new row keeps its own hand-written short line (Fable F3)', true, (c, g, run) => {
  g('checkout', '-q', '-b', 'a'); c.edit(AREA, t => topOf(t, newFull('D9', '**Three things:** one, two, three.'))); c.write('short.tsv', 'D9\tNine means one, two and three.\n')
  const r0 = run('--rulings', '--short-text', 'short.tsv'); if (r0.status !== 0) throw new Error(r0.stderr); rmSync(join(c.dir, 'short.tsv')); c.commit('a files D9')
  g('checkout', '-q', 'main'); c.edit(FULL, t => t.replace('**Rule b.** b |', '**Rule b.** b, on main |')); c.commit('main edits D2')
  mergeIn(g, 'main', 'a'); return run('--rulings', '--merge') }, (c, r) =>
  !has(c, AREA, '| D9 | 22 Sep 26 | Nine means one, two and three. |') ? 'the other side\'s short line was not kept' : /UNREAD[\s\S]*\| D9 \|/.test(r.stdout) ? 'it was listed UNREAD although it was read on its own side' : !has(c, FULL, 'b, on main') ? 'our edit was lost' : '')
gitRulings('an old-layout branch that CREATED an area file merges, its map row carried (Astra 2, Fable F2)', true, (c, g, run) => {
  c.write(AREA, AREA_OLD); rmSync(join(c.dir, FULL)); c.commit('the old layout — the merge base')
  g('checkout', '-q', '-b', 'old'); c.write(OTHER, OTHER_HEAD.replace('| # | Date | The rule |\n|---|---|---|\n', '| # | Date | ruling | meaning | home |\n|---|---|---|---|---|\n') + newFull('D9', '**Nine lives in other.**') + '\n'); addOther(c, 'D9'); c.commit('old creates other.md')
  g('checkout', '-q', 'main'); g('checkout', '-q', '-b', 'slim'); const r0 = run('--rulings'); if (r0.status !== 0) throw new Error(r0.stderr); c.commit('slim')
  mergeIn(g, 'slim', 'old'); return run('--rulings', '--merge') }, (c, r) =>
  !has(c, OTHER, '| D9 | 22 Sep 26 | Nine lives in other. |') || c.read(OTHER).split('| D9 |').length !== 2 ? 'D9 is not in other.md exactly once, as a short line'
  : !existsSync(join(c.dir, OTHER_FULL)) || c.read(OTHER_FULL).split('| D9 |').length !== 2 ? 'D9\'s full row is not in other\'s full-text file exactly once'
  : !c.read('DECISIONS.md').includes('other.md` | always | D9 |') ? 'the map row was not carried' : '')
gitRulings('an old row this side moved and the other side marked keeps BOTH changes', true, (c, g, run) => {
  c.write(OTHER, OTHER_HEAD); addOther(c, '—'); c.write(AREA, AREA_OLD); rmSync(join(c.dir, FULL)); c.commit('the old layout, an empty area beside it')
  g('checkout', '-q', '-b', 'old'); c.edit(AREA, t => t.replace(fullRow('D2', 'b'), fullRow('D2', 'b').replace('**Rule b.** b', '**— NARROWED 23 Sep 26 BY D1: less.** **Rule b.** b'))); c.commit('old marks D2')
  g('checkout', '-q', 'main'); g('checkout', '-q', '-b', 'slim'); run('--rulings'); run('--rulings', '--move-rows', 'D2', '--to', 'other'); c.commit('slim converts and moves D2')
  mergeIn(g, 'slim', 'old'); return run('--rulings', '--merge') }, (c, r) =>
  !has(c, OTHER_FULL, '**— NARROWED 23 Sep 26 BY D1: less.**') ? 'the other side\'s mark was lost, or D2 left other' : has(c, AREA, '| D2 |') ? 'D2 is back in general' : !has(c, OTHER, ' — changed by D1 |') ? 'the tail was not refreshed' : '')

/* ---- The verifications of the fixes (Fable and Astra, 28 Sep 26): one case per point ---- */
{ /* the change-mark grammar, read directly */
  const RLx = await import(pathToFileURL(join(HERE, 'docsize-rulings.mjs')).href)
  const marks = (words, meaning) => [...RLx.marksOf(['D99', '1 Oct 26', words, meaning, 'x'])].sort().join(',')
  const cases = [
    ['AMENDED AGAIN, dated', marks('w', '**— AMENDED AGAIN 25 Sep 26 BY D180: x.** **Rule.**'), 'D180'],
    ['SUPERSEDED IN PART, dated, lower-case by', marks('w', '**SUPERSEDED IN PART 22 Sep 26 by D24** — y. **Rule.**'), 'D24'],
    ['two numbers before the colon', marks('w', '**— ANSWERED 27 Sep 26 BY D310 (a) and D322 (b); BUILT with x**'), 'D310,D322'],
    ['a mark in the ruling cell', marks('**EXTENDED BY D86 (same evening): z.** his words', '**Rule.**'), 'D86'],
    ['"Narrows D217" names no mark', marks('w', '**Narrows D217** (26 Sep 26). **Rule.**'), ''],
    ['SETTLED BY', marks('w', '**— SETTLED 28 Sep 26 BY D345: approved.** **Rule.**'), 'D345'],
  ]
  for (const [name, got, want] of cases) { const ok = got === want; if (!ok) failed++; console.log(`${ok ? 'PASS' : 'MISS'}  marks: ${name} — expected [${want}], got [${got}]`) }
}
mover('a lookalike under an archived number (its own bold words, then the same tail) is refused, not dropped', false, { prep: c => c.edit(AREA, t => topOf(t, '| D0 | 20 Sep 26 | **A brand-new instruction.** z | z | `OUTSTANDING.md` |')), args: ['--rulings'], check: (c, r) => /never reused/.test(r.stderr) ? '' : 'it was not refused as a reused number' })
mover('a stale live copy whose ruling cell opens with HIS bold words is dropped as the same ruling', true, { prep: c => {
  c.edit('DECISIONS-ARCHIVE.md', t => t.replace('**REPLACED BY D1 (21 Sep 26).** z', '**REPLACED BY D1 (21 Sep 26).** **Never** z')); c.commit('an archived row with his own bold words')
  c.edit(FULL, t => topOf(t, '| D0 | 20 Sep 26 | **Never** z | z | `OUTSTANDING.md` |')); c.edit(AREA, t => topOf(t, '| D0 | 20 Sep 26 | Rule z. |')) }, args: ['--rulings'], check: c => has(c, FULL, '| D0 |') || has(c, AREA, '| D0 |') ? 'the stale copy stayed' : '' })
mover('a full row holding an escaped "\\|" converts', true, { prep: c => c.edit(AREA, t => topOf(t, newFull('D9', '**Nine is the rule.** a \\| b'))), args: ['--rulings'], check: c => !has(c, FULL, 'a \\| b') || !has(c, AREA, '| D9 | 22 Sep 26 | Nine is the rule. |') ? 'it did not convert whole' : '' })
mover('a whole CRLF rulings set converts, every line keeping CRLF', true, { prep: c => { for (const f of ['DECISIONS.md', 'DECISIONS-ARCHIVE.md']) c.edit(f, t => t.replace(/\n/g, '\r\n')); c.write(AREA, AREA_OLD.replace(/\n/g, '\r\n')); rmSync(join(c.dir, FULL)); c.commit('CRLF, old layout') }, args: ['--rulings'], check: c =>
  !c.read(FULL).includes(fullRow('D2', 'b') + '\r\n' + fullRow('D1', 'a') + '\r\n') ? 'the full rows did not arrive with CRLF' : /(^|[^\r])\n/.test(c.read(AREA)) || /(^|[^\r])\n/.test(c.read(FULL)) ? 'a bare LF crept in' : '' })
mover('a temporary copy from an interrupted run stops the next run', false, { prep: c => c.write(FULL + '.docmove-tmp', 'half-written\n'), args: ['--rulings'], check: (c, r) => /interrupted run/.test(r.stderr) && c.read(FULL + '.docmove-tmp') === 'half-written\n' ? '' : 'it did not refuse, or it touched the copy' })
gitRulings('the other side alone moves a ruling between areas: it moves here too', true, (c, g, run) => {
  c.write(OTHER, OTHER_HEAD); addOther(c, '—'); c.commit('an empty other area')
  g('checkout', '-q', '-b', 'a'); run('--rulings', '--move-rows', 'D1', '--to', 'other'); c.commit('a moves D1')
  g('checkout', '-q', 'main'); c.edit(FULL, t => t.replace('**Rule b.** b |', '**Rule b.** b, on main |')); c.commit('main edits D2')
  mergeIn(g, 'main', 'a'); return run('--rulings', '--merge') }, c => has(c, AREA, '| D1 |') || !has(c, OTHER, shortRow('D1', 'a')) || !has(c, OTHER_FULL, fullRow('D1', 'a')) ? 'D1 did not follow the other side\'s move' : !has(c, FULL, 'b, on main') ? 'our edit was lost' : '')
gitRulings('retired there, its row changed here: stops', false, (c, g, run) => {
  g('checkout', '-q', '-b', 'a'); c.edit(FULL, t => t.replace('| D1 | 21 Sep 26 | a |', '| D1 | 21 Sep 26 | **SPENT 22 Sep 26 — used.** a |')); run('--rulings'); c.commit('a retires D1')
  g('checkout', '-q', 'main'); c.edit(FULL, t => t.replace('**Rule a.** a |', '**Rule a.** a, on main |')); c.commit('main edits D1')
  mergeIn(g, 'main', 'a'); return run('--rulings', '--merge') }, (c, r) => /retired there but its row changed here/.test(r.stderr) ? '' : 'wrong reason')
gitRulings('retired here, its short line rewritten there: the retirement stands, no false stop', true, (c, g, run) => {
  g('checkout', '-q', '-b', 'a'); c.edit(AREA, t => t.replace(shortRow('D1', 'a'), '| D1 | 21 Sep 26 | Rule a, rewritten. |')); c.commit('a rewrites D1\'s line')
  g('checkout', '-q', 'main'); c.edit(FULL, t => t.replace('| D1 | 21 Sep 26 | a |', '| D1 | 21 Sep 26 | **SPENT 22 Sep 26 — used.** a |')); run('--rulings'); c.commit('main retires D1')
  mergeIn(g, 'main', 'a'); return run('--rulings', '--merge') }, c => has(c, AREA, '| D1 |') || has(c, FULL, '| D1 |') ? 'D1 is live again' : '')
gitRulings('the same ruling filed on both sides (a cherry-pick) stays one ruling', true, (c, g, run) => {
  g('checkout', '-q', '-b', 'a'); c.edit(AREA, t => topOf(t, newFull('D9', '**Nine is the rule.**'))); run('--rulings'); c.commit('a files D9')
  g('checkout', '-q', 'main'); c.edit(AREA, t => topOf(t, newFull('D9', '**Nine is the rule.**'))); run('--rulings'); c.edit(FULL, t => t.replace('**Rule b.** b |', '**Rule b.** b, on main |')); c.commit('main files the same D9')
  mergeIn(g, 'main', 'a'); return run('--rulings', '--merge') }, c => c.read(FULL).split('| D9 |').length !== 2 || c.read(AREA).split('| D9 |').length !== 2 ? 'D9 is not there exactly once' : '')
gitRulings('an edit to a map row\'s "loads by itself" cell on the other side is printed, never lost silently', true, (c, g, run) => {
  g('checkout', '-q', '-b', 'a'); c.edit('DECISIONS.md', t => t.replace(mapRow('General', AREA, 'D2, D1'), mapRow('General', AREA, 'D2, D1').replace('| always |', '| when a general file is read |'))); c.commit('a edits the map row')
  g('checkout', '-q', 'main'); c.edit(FULL, t => t.replace('**Rule b.** b |', '**Rule b.** b, on main |')); c.commit('main edits D2')
  mergeIn(g, 'main', 'a'); return run('--rulings', '--merge') }, (c, r) => /RE-APPLY BY HAND[\s\S]*when a general file is read/.test(r.stdout) ? '' : 'the map row edit was not printed')
gitRulings('a refused heading mid-merge names --short-text, and writes nothing', false, (c, g, run) => {
  c.write(AREA, AREA_OLD); rmSync(join(c.dir, FULL)); c.commit('the old layout — the merge base')
  g('checkout', '-q', '-b', 'old'); c.edit(AREA, t => topOf(t, newFull('D9', '**Three things:** one, two, three.'))); setMap(c, AREA, 'D9, D2, D1'); c.commit('old files D9')
  g('checkout', '-q', 'main'); g('checkout', '-q', '-b', 'slim'); run('--rulings'); c.commit('slim')
  mergeIn(g, 'old', 'slim'); c.snap = c.read(AREA); return run('--rulings', '--merge') }, (c, r) =>
  !/--short-text/.test(r.stderr) || !/read from git/.test(r.stderr) ? 'the refusal does not point at --short-text' : c.read(AREA) !== c.snap ? 'it wrote anyway' : '')

gitRulings('a merge whose result still owes hand work keeps it WRITTEN and names the work (the first real trial, 28 Sep 26)', false, (c, g, run) => {
  c.write(AREA, AREA_OLD); rmSync(join(c.dir, FULL)); c.commit('the old layout — the merge base')
  g('checkout', '-q', '-b', 'old'); c.edit(AREA, t => topOf(t, newFull('D9', '**Nine is the rule.** Narrows D2 for one case.'))); setMap(c, AREA, 'D9, D2, D1'); c.commit('old files D9, which narrows D2, unmarked')
  g('checkout', '-q', 'main'); g('checkout', '-q', '-b', 'slim'); run('--rulings'); c.commit('slim')
  mergeIn(g, 'old', 'slim'); return run('--rulings', '--merge') }, (c, r) =>
  !/WRITTEN/.test(r.stderr) || !/carries no mark naming D9/.test(r.stderr) ? 'it did not say WRITTEN and name the missing mark'
  : !existsSync(join(c.dir, FULL)) || !has(c, FULL, '**Nine is the rule.**') || !has(c, AREA, '| D9 | 22 Sep 26 | Nine is the rule. |') ? 'the result was not left written' : '')

/* --merge ACROSS THE PAGE SHAPE (owner, D1735 — the rules diet's step 1, part 3b; plan §5): a real `git merge` between a
   branch that converted the area `other` to a page (recording D8, stated on it) and one still in short lines (D9 filed,
   D5's short line, D6's full row and the "Also read" line edited), each way. The page is taken whole and keeps no row;
   the old side's rows reach the full-text file; what the old side changed is listed PLACE ON THE PAGE and never written,
   D8 not; the map lists the full-text file's rulings; the gate stays red for D9 until a line states it — so the result is
   judged by the files and the output, and the command ends WRITTEN. Then a page changed on both sides. */
const OTHER_SHORT0 = OTHER_HEAD.replace('# Rulings — other\n\n', '# Rulings — other\n\nAlso read — nothing yet.\n\n') + shortRow('D6', 'f') + '\n' + shortRow('D5', 'e') + '\n'
const D8full = newFull('D8', '**Eight is the rule.**')
const PAGE8 = otherPage({ topic: [p5, '- Rule eight holds on the other screens as well [D8].'] })
const D6edit = fullRow('D6', 'f', 'this file').replace('**Rule f.** f', '**Rule f.** f, edited on the old branch')
function pageMerge(name, { unconverted = false, into }) {
  gitRulings(name, false, (c, g, run) => {
    c.write(OTHER, OTHER_SHORT0); c.write(OTHER_FULL, OTHER_FULL0); addOther(c, 'D6, D5'); c.commit('the base: other in short lines')
    g('checkout', '-q', '-b', 'page'); c.write(OTHER, PAGE8); c.edit(OTHER_FULL, t => topOf(t, D8full)); setMap(c, OTHER, 'D8, D6, D5')
    const r0 = run('--rulings'); if (r0.status !== 0) throw new Error('the page branch is not clean: ' + r0.stdout + r0.stderr); c.commit('page: other converted, D8 recorded')
    g('checkout', '-q', 'main'); g('checkout', '-q', '-b', 'old')
    c.edit(OTHER, t => topOf(t, unconverted ? D9row : shortRow('D9', 'i', '', '22 Sep 26')).replace(shortRow('D5', 'e'), shortRow('D5', 'e').replace('Rule e.', 'Rule e, edited on the old branch.')).replace('Also read — nothing yet.', 'Also read — D1, added on the old branch.'))
    c.edit(OTHER_FULL, t => (unconverted ? t : topOf(t, D9row)).replace(fullRow('D6', 'f', 'this file'), D6edit)); setMap(c, OTHER, 'D9, D6, D5'); c.commit('old: D9, D5, D6 and a line')
    mergeIn(g, into, into === 'page' ? 'old' : 'page'); return run('--rulings', '--merge')
  }, (c, r) => {
    const full = c.read(OTHER_FULL), at = s => full.indexOf(s), place = (r.stdout.split('PLACE ON THE PAGE')[1] || '').split('\n\n')[0]
    const map = (c.read('DECISIONS.md').split('\n').find(l => l.includes('`' + OTHER + '`')) || '').split('|').slice(-2)[0].trim()
    return [OTHER, OTHER_FULL, 'DECISIONS.md'].some(f => /^(<{7}|>{7}|={7})/m.test(c.read(f))) ? 'conflict markers left'
      : c.read(OTHER) !== PAGE8 ? 'the page was not taken whole, or a row was left on it'
      : at(D9row) < 0 || at(D8full) < 0 || at(D6edit) < 0 || Math.max(at(D9row), at(D8full)) > at(D6edit) ? 'D9 and D8 are not both at the top of the full-text table, whole, with the old side\'s edit of D6'
      : !/D9 \("[^"]*"\) — new on/.test(place) || !/D5 — its short line changed/.test(place) || !/D6 — its full row changed/.test(place) || !/\+ Also read — D1, added on the old branch\./.test(place) ? 'PLACE ON THE PAGE does not list D9, D5, D6 and the line'
      : /D8/.test(place) ? 'D8, stated on the page, was listed to place'
      : map.split(', ').sort().join() !== 'D5,D6,D8,D9' ? `the map lists ${map}, not the full-text file's rulings`
      : !/WRITTEN/.test(r.stderr) || !/D9/.test(r.stderr) ? 'it did not end WRITTEN with the gate naming D9' : ''
  })
}
pageMerge('a page merged with a branch still in short lines — the page branch merges the old one in', { into: 'page' })
pageMerge('…the old branch merges the page in — the same result, the old shape never written back', { into: 'old' })
pageMerge('…a ruling the old branch never ran the recorder on, merged into the page branch', { into: 'page', unconverted: true })
pageMerge('…the same, merged into the old branch: its row leaves the page for the full-text table', { into: 'old', unconverted: true })
const pageBoth = (c, g, run, a, m) => {
  withPage(c); c.commit('the base: other a page')
  g('checkout', '-q', '-b', 'a'); c.edit(OTHER, a); c.commit('a')
  g('checkout', '-q', 'main'); c.edit(OTHER, m); c.commit('main')
  mergeIn(g, 'a', 'main'); c.snap = c.read(OTHER); return run('--rulings', '--merge')
}
gitRulings('a page line both sides edited stops the command, naming it — nothing written', false, (c, g, run) => pageBoth(c, g, run, t => t.replace(p5, p5.replace('area', 'area, from a')), t => t.replace(p5, p5.replace('area', 'area, from main'))), (c, r) =>
  !/both sides edited the same page line/.test(r.stderr) || !/from a/.test(r.stderr) || !/from main/.test(r.stderr) ? 'it did not name the line both sides edited' : c.read(OTHER) !== c.snap ? 'it wrote anyway' : '')
gitRulings('different lines of one page edited on each side merge clean', true, (c, g, run) => pageBoth(c, g, run, t => t.replace(p5, p5.replace('area', 'area, from a')), t => t.replace('built with [D6]', 'built with, from main [D6]')), c =>
  !has(c, OTHER, 'area, from a [D5]') || !has(c, OTHER, 'built with, from main [D6]') ? 'one side\'s line was lost' : '')
gitRulings('an area converted to a page on both sides since the base stops the command', false, (c, g, run) => {
  c.write(OTHER, OTHER_SHORT0); c.write(OTHER_FULL, OTHER_FULL0); addOther(c, 'D6, D5'); c.commit('the base: other in short lines')
  g('checkout', '-q', '-b', 'a'); c.write(OTHER, otherPage()); c.commit('a converts')
  g('checkout', '-q', 'main'); c.write(OTHER, otherPage({ settled: ['- The other screen keeps its first look, as built [D6].'] })); c.commit('main converts')
  mergeIn(g, 'a', 'main'); c.snap = c.read(OTHER); return run('--rulings', '--merge') }, (c, r) =>
  !/converted to a page on both sides/.test(r.stderr) ? 'it did not say so' : c.read(OTHER) !== c.snap ? 'it wrote anyway' : '')
/* the step-1 reader's F5: a page stop is resolved in the file itself, and the next run takes the resolution */
const markersIn = c => [OTHER, OTHER_FULL, 'DECISIONS.md'].some(f => /^(<{7}|>{7}|={7})/m.test(c.read(f)))
gitRulings('a page line both sides edited, resolved by hand in the file: the next run takes it (F5)', true, (c, g, run) => {
  withPage(c); c.commit('the base: other a page')
  const rec = (d, row, line) => { c.edit(OTHER_FULL, t => topOf(t, row)); c.edit(OTHER, t => t.replace(p5, p5 + '\n' + line)); const r = run('--rulings'); if (r.status !== 0) throw new Error(r.stdout + r.stderr) }
  const l7 = '- Rule seven holds on the other screens as well [D7].', l8 = '- Rule eight holds on the other screens as well [D8].'
  g('checkout', '-q', '-b', 'a'); rec('D7', D7full, l7); c.commit('a records D7')
  g('checkout', '-q', 'main'); rec('D8', D8full, l8); c.commit('main records D8')
  mergeIn(g, 'a', 'main'); c.r1 = run('--rulings', '--merge')
  c.write(OTHER, otherPage({ topic: [p5, l7, l8] })); return run('--rulings', '--merge') }, c =>
  c.r1.status === 0 || !/both sides edited the same page line/.test(c.r1.stderr) || !/in the file itself/.test(c.r1.stderr) ? 'the first run did not stop, saying to resolve it in the file itself'
  : markersIn(c) ? 'conflict markers left' : !has(c, OTHER, '[D7]') || !has(c, OTHER, '[D8]') ? 'the hand resolution was not kept' : !has(c, OTHER_FULL, D7full) || !has(c, OTHER_FULL, D8full) ? 'a row did not reach the full-text table' : '')
gitRulings('…an area converted on both sides, one side\'s page kept by hand in the file: the next run takes it (F5)', true, (c, g, run) => {
  c.write(OTHER, OTHER_SHORT0); c.write(OTHER_FULL, OTHER_FULL0); addOther(c, 'D6, D5'); c.commit('the base: other in short lines')
  g('checkout', '-q', '-b', 'a'); c.write(OTHER, otherPage()); c.commit('a converts')
  g('checkout', '-q', 'main'); c.write(OTHER, otherPage({ settled: ['- The other screen keeps its first look, as built [D6].'] })); c.commit('main converts')
  mergeIn(g, 'a', 'main'); c.r1 = run('--rulings', '--merge'); c.write(OTHER, otherPage()); return run('--rulings', '--merge') }, c =>
  c.r1.status === 0 || !/in the file itself/.test(c.r1.stderr) ? 'the first run did not stop, saying to resolve it in the file itself' : markersIn(c) ? 'conflict markers left' : c.read(OTHER) !== otherPage() ? 'the kept page was not taken' : '')
/* the step-1 reader's F3: a new area created directly as a page on one side, merged each way */
const newAreaPage = into => (c, g, run) => {
  g('checkout', '-q', '-b', 'a'); withFourth(c, fourthPage({ topic: ['- Rule eleven holds on every screen of the fourth area [D11].', '- Rule seven holds on the fourth screens as well [D7].'] }), D7in4, 'D7, D11')
  const r0 = run('--rulings'); if (r0.status !== 0) throw new Error('the new page is not clean: ' + r0.stdout + r0.stderr); c.commit('a: a new area, made a page')
  g('checkout', '-q', 'main'); c.edit(FULL, t => t.replace('**Rule b.** b |', '**Rule b.** b, on main |')); c.commit('main edits D2')
  mergeIn(g, into, into === 'a' ? 'main' : 'a'); return run('--rulings', '--merge')
}
const newAreaOk = c => c.read(FOURTH_FULL).split('| D7 |').length !== 2 || c.read(FOURTH_FULL).split('| D11 |').length !== 2 ? 'D7 and D11 are not each once in the full-text file' : has(c, FOURTH, '| D') ? 'a row was put on the page' : !has(c, FULL, 'b, on main') ? 'main\'s edit of D2 was lost' : !/fourth\.md` \| always \| D7, D11 \|/.test(c.read('DECISIONS.md')) ? 'the map row did not follow' : ''
gitRulings('a new area made a page on the branch being merged in (F3)', true, newAreaPage('main'), newAreaOk)
gitRulings('…the same, main merged into that branch (F3)', true, newAreaPage('a'), newAreaOk)
/* the step-1 reader's F4: what the side still in short lines retired or moved out of an area the other side made a page */
const pageVsOld = (into, oldWork) => (c, g, run) => {
  c.write(OTHER, OTHER_SHORT0); c.write(OTHER_FULL, OTHER_FULL0); addOther(c, 'D6, D5'); c.commit('the base: other in short lines')
  g('checkout', '-q', '-b', 'page'); c.write(OTHER, otherPage()); const r0 = run('--rulings'); if (r0.status !== 0) throw new Error(r0.stdout + r0.stderr); c.commit('page: other converted')
  g('checkout', '-q', 'main'); g('checkout', '-q', '-b', 'old'); oldWork(c, run); c.commit('old')
  mergeIn(g, into, into === 'page' ? 'old' : 'page'); return run('--rulings', '--merge')
}
const spendD6 = (c, run) => { c.edit(OTHER_FULL, t => t.replace('| D6 | 21 Sep 26 | f |', '| D6 | 21 Sep 26 | **SPENT 22 Sep 26 — used.** f |')); const r = run('--rulings'); if (r.status !== 0) throw new Error(r.stdout + r.stderr) }
const moveD5 = (c, run) => { const r = run('--rulings', '--move-rows', 'D5', '--to', 'general'); if (r.status !== 0) throw new Error(r.stdout + r.stderr) }
const placed = (r, re) => re.test((r.stdout.split('PLACE ON THE PAGE')[1] || '').split('\n\n')[0])
gitRulings('a ruling the short-line branch spent, merged into the page branch, is listed to take off the page (F4)', true, pageVsOld('page', spendD6), (c, r) => placed(r, /D6[^\n]*retired on the branch being merged in[^\n]*take it off the page \(line \d+\)/) ? '' : 'not listed')
gitRulings('…the page merged into the short-line branch (F4)', true, pageVsOld('old', spendD6), (c, r) => placed(r, /D6[^\n]*retired on your branch[^\n]*take it off the page \(line \d+\)/) ? '' : 'not listed')
gitRulings('a ruling the short-line branch moved out, the page merged into it, is listed to move (F4)', true, pageVsOld('old', moveD5), (c, r) => placed(r, /D5[^\n]*moved to general\.md on your branch[^\n]*\(line \d+\)/) ? '' : 'not listed')
gitRulings('…the short-line branch merged into the page branch: MOVE ON THE PAGES names the line (F4)', true, pageVsOld('page', moveD5), (c, r) => /MOVE ON THE PAGES[\s\S]*other\.md line \d+ \(## The rules\) states D5, now of general\.md/.test(r.stdout) ? '' : 'not printed')
/* the second reader's finding (7 Nov 26): a new area made a page on one side WITH A RULING MOVED ONTO IT, that ruling
   changed on the other side since the base — merged each way, the change is listed to place on the page, never stopped
   on for a short line the page side does not have, and never sent to REWRITE as if it had one */
const movedOnto = (into, mainWork) => (c, g, run) => {
  g('checkout', '-q', '-b', 'a'); withFourth(c, fourthPage({ topic: ['- Rule eleven holds on every screen of the fourth area [D11].', '- Rule a holds on every screen of the fourth area as well [D1].'], from: [] }))
  const r0 = run('--rulings', '--move-rows', 'D1', '--to', 'fourth'); if (r0.status !== 0) throw new Error('the move onto the new page did not run clean: ' + r0.stdout + r0.stderr); c.commit('a: a new area made a page, D1 moved onto it')
  g('checkout', '-q', 'main'); mainWork(c, run); c.commit('main changes D1')
  mergeIn(g, into, into === 'a' ? 'main' : 'a'); return run('--rulings', '--merge')
}
const markD1r = (c, run) => { narrowD1(c); const r = run('--rulings'); if (r.status !== 0) throw new Error(r.stdout + r.stderr) }
const rewordD1 = c => c.edit(FULL, t => t.replace('**Rule a.** a |', '**Rule a.** a, reworded on main |'))
const rewordD1both = c => { c.edit(FULL, t => t.replace('**Rule a.** a |', '**Rule a, on main.** a |')); c.edit(AREA, t => t.replace(shortRow('D1', 'a'), shortRow('D1', 'a, on main'))) }
const noShortD1 = c => has(c, AREA, '| D1 |') ? 'a short line for D1 came back to general.md' : ''
const notStoppedOnShort = r => /short line was changed on both sides/.test(r.stderr) ? 'it stopped on a short line the page side does not have' : ''
gitRulings('a ruling moved onto a new page, marked on main, main merged into the page branch: listed, the gate then names the mark', false, movedOnto('a', markD1r), (c, r) =>
  notStoppedOnShort(r) || (!/WRITTEN/.test(r.stderr) ? 'the merge was not written' : !has(c, FOURTH_FULL, 'NARROWED 22 Sep 26 BY D2') ? 'main\'s mark did not reach D1\'s full row' : !placed(r, /fourth\.md: D1[^\n]*short line changed on the branch being merged in/) ? 'the short-line change was not listed to place on the page' : !/does not cite D2/.test(r.stdout + r.stderr) ? 'the missing change mark was not named' : noShortD1(c)))
gitRulings('…its full row reworded on main: listed to read against, never sent to REWRITE', true, movedOnto('a', rewordD1), (c, r) =>
  /REWRITE[\s\S]*D1 —/.test(r.stdout) ? 'it was sent to REWRITE, which reads a short line it does not have' : !placed(r, /fourth\.md: D1[^\n]*full row changed on the other side[^\n]*\(line \d+\)/) ? 'the reworded row was not listed with its page line' : !has(c, FOURTH_FULL, 'a, reworded on main') ? 'main\'s rewording was lost' : noShortD1(c))
gitRulings('…its short line and full row reworded on main: listed, not stopped', true, movedOnto('a', rewordD1both), (c, r) =>
  notStoppedOnShort(r) || (!placed(r, /fourth\.md: D1[^\n]*short line changed on the branch being merged in[^\n]*Rule a, on main/) ? 'the short-line change was not listed' : !has(c, FOURTH_FULL, '**Rule a, on main.**') ? 'main\'s rewording was lost' : noShortD1(c)))
const changedHere = /fourth\.md: D1[^\n]*changed on your branch since the base, and moved onto this page on the branch being merged in[^\n]*\(line \d+\)/
gitRulings('…the page branch merged into main, D1 marked on main: listed, the gate then names the mark', false, movedOnto('main', markD1r), (c, r) =>
  !/WRITTEN/.test(r.stderr) ? 'the merge was not written' : !placed(r, changedHere) ? 'main\'s change was not listed against the page line' : !/does not cite D2/.test(r.stdout + r.stderr) ? 'the missing change mark was not named' : noShortD1(c))
gitRulings('…the page branch merged into main, D1\'s full row reworded on main: listed against the page line', true, movedOnto('main', rewordD1), (c, r) =>
  !placed(r, changedHere) ? 'main\'s rewording was not listed against the page line' : !has(c, FOURTH_FULL, 'a, reworded on main') ? 'main\'s rewording was lost' : noShortD1(c))
gitRulings('…the page branch merged into main, D1\'s short line and full row reworded on main: listed', true, movedOnto('main', rewordD1both), (c, r) =>
  !placed(r, changedHere) ? 'main\'s rewording was not listed against the page line' : !has(c, FOURTH_FULL, '**Rule a, on main.**') ? 'main\'s rewording was lost' : noShortD1(c))
/* the second reader's side note: the map row of an area taken whole is inserted, so it is never offered again to re-apply */
gitRulings('a new area\'s map row, carried by the merge, is not printed again under RE-APPLY BY HAND', true, newAreaPage('main'), (c, r) =>
  /RE-APPLY BY HAND[\s\S]*fourth\.md/.test(r.stdout) ? 'the carried map row is offered again to re-apply' : newAreaOk(c))
/* the third reader's read of that fix (7 Nov 26): a ruling moved onto a page since the base and retired on the other
   side is listed to take off the page (a SPENT ruling is no stale citation to the gate, so only this list catches it);
   a line of DECISIONS.md that only names a new area's file is still re-applied; and a move is never called "changed"
   for a short line this side no longer has */
const spendD1 = (c, run) => { c.edit(FULL, t => t.replace('| D1 | 21 Sep 26 | a |', '| D1 | 21 Sep 26 | **SPENT 22 Sep 26 — used.** a |')); const r = run('--rulings'); if (r.status !== 0) throw new Error('spend: ' + r.stdout + r.stderr) }
const offPage = (side, f = 'fourth') => new RegExp(`${f}\\.md: D1[^\\n]*retired on ${side} since the base: take it off the page \\(line \\d+(?:, \\d+)*\\)`)
gitRulings('a ruling moved onto a new page, spent on main, main merged into the page branch: listed to take off the page', true, movedOnto('a', spendD1), (c, r) =>
  !placed(r, offPage('the branch being merged in')) ? 'not listed' : !has(c, 'DECISIONS-ARCHIVE.md', '| D1 |') ? 'D1 was not archived' : '')
gitRulings('…the page branch merged into main: listed to take off the page', true, movedOnto('main', spendD1), (c, r) =>
  !placed(r, offPage('your branch')) ? 'not listed' : !has(c, 'DECISIONS-ARCHIVE.md', '| D1 |') ? 'D1 was not archived' : '')
const bothPage = into => (c, g, run) => {
  withPage(c); c.commit('the base: other a page')
  g('checkout', '-q', '-b', 'a'); c.edit(OTHER, t => t.replace(p5, p5 + '\n- Rule a holds on the other screens as well [D1].'))
  const r0 = run('--rulings', '--move-rows', 'D1', '--to', 'other'); if (r0.status !== 0) throw new Error('the move onto the page did not run clean: ' + r0.stdout + r0.stderr); c.commit('a moves D1 onto the page')
  g('checkout', '-q', 'main'); spendD1(c, run); c.commit('main spends D1')
  mergeIn(g, into, into === 'a' ? 'main' : 'a'); return run('--rulings', '--merge')
}
gitRulings('…the same on a page both sides hold, main merged into the branch that moved it', true, bothPage('a'), (c, r) => placed(r, offPage('the branch being merged in', 'other')) ? '' : 'not listed')
gitRulings('…the same on a page both sides hold, that branch merged into main', true, bothPage('main'), (c, r) => placed(r, offPage('your branch', 'other')) ? '' : 'not listed')
const proseNamingFourth = 'The area `.claude/rules/decisions/fourth.md` was made a page from the start (a line of its own).'
const newAreaPageProse = (c, g, run) => {
  g('checkout', '-q', '-b', 'a'); withFourth(c, fourthPage({ topic: ['- Rule eleven holds on every screen of the fourth area [D11].', '- Rule seven holds on the fourth screens as well [D7].'] }), D7in4, 'D7, D11')
  c.edit('DECISIONS.md', t => t + proseNamingFourth + '\n')
  const r0 = run('--rulings'); if (r0.status !== 0) throw new Error('the new page is not clean: ' + r0.stdout + r0.stderr); c.commit('a: a new area, made a page')
  g('checkout', '-q', 'main'); c.edit(FULL, t => t.replace('**Rule b.** b |', '**Rule b.** b, on main |')); c.commit('main edits D2')
  mergeIn(g, 'main', 'a'); return run('--rulings', '--merge')
}
gitRulings('…but a line of DECISIONS.md that only names the new area\'s file is still re-applied by hand', true, newAreaPageProse, (c, r) =>
  !/RE-APPLY BY HAND[\s\S]*made a page from the start/.test(r.stdout) ? 'the line naming the new area was dropped unseen' : /RE-APPLY BY HAND[^\n]*\n(?:[^\n]*\n)*?[^\n]*\+ \| Fourth \|/.test(r.stdout) ? 'the carried map row is offered again to re-apply' : newAreaOk(c))
const convertGeneral = (c, run) => { c.write(AREA, GENERAL_PAGE); const r = run('--rulings'); if (r.status !== 0) throw new Error('convert: ' + r.stdout + r.stderr) }
gitRulings('a move onto a page is not called "changed here" because this side made the ruling\'s own area a page', true, movedOnto('main', convertGeneral), (c, r) =>
  /fourth\.md: D1[^\n]*changed on your branch/.test(r.stdout) ? 'D1 was called changed although only its area became a page' : /MOVE ON THE PAGES[\s\S]*general\.md line \d+[^\n]*states D1, now of fourth\.md/.test(r.stdout) ? '' : 'the general page\'s line was not printed to move')

/* docsize --reads (owner, D1735 — the rules diet's step 1, part 3c; plan §1, §5): what a chat reads, followed through
   the rules files' paths: until nothing new loads, each file counted once, in the first column that loads it. Run on a
   small set held in memory; a report, so these cases check the arithmetic and the follow-through, never a ceiling. */
function reads(name, fn) { const why = fn(); if (why) failed++; console.log(`${why ? 'MISS' : 'PASS'}  reads: ${name}${why ? ` (${why})` : ''}`) }
const RFILES = {
  '.claude/rules/always.md': '# Always\n\nLoaded in every chat.\n',
  '.claude/rules/area-a.md': '---\npaths:\n  - app/a/**\n  # a comment line, skipped\n---\n\n# Area A\n',
  '.claude/rules/area-b.md': '---\npaths:\n  - docs/guide.md\n  - .claude/rules/area-a.md\n---\n\n# Area B, read in turn\n',
  '.claude/rules/area-c.md': '---\npaths:\n  - app/c/**\n---\n\n# Area C, never opened\n',
  'app/CLAUDE.md': '# The app guide\n',
  '.claude/hooks/task-observer-session-start.sh': '#!/usr/bin/env bash\n# a comment naming <<EOF, never a note\nread -r -d \'\' X <<\'EOF\' || true\nthe start note\nEOF\n',
  '.claude/hooks/record-decisions.sh': 'cat <<\'NOTE\'\nthe message note\nNOTE\n',
  '.claude/skills/s/SKILL.md': '---\nname: s\ndescription: >\n  a skill, described\n  over two lines\n---\n\nThe body, never listed.\n',
  '.claude/agents/h.md': '---\nname: h\ndescription: a helper\n---\nbody\n',
  'HANDOFF.md': '# Handoff\n', 'OUTSTANDING.md': '# Backlog\n\nthe priority list\n\n## Items\n\nnever read at the start\n',
  'docs/guide.md': '# Guide\n\n## 1. One\n\nthe first part\n\n### 1a. Below it\n\nstill the first\n\n## 2. Two\n\nnot read\n',
}
const rRead = f => RFILES[f] ?? null, rEst = t => t.length
const rRun = (over = {}) => READS.measure({ files: Object.keys(RFILES), read: rRead, est: rEst, jobs: [{ job: 'notes', opens: [], check: false }, { job: 'a', opens: ['app/a/x.ts'] }], taskReads: [{ f: 'HANDOFF.md' }, { f: 'OUTSTANDING.md', upTo: '## Items' }], checkReads: [{ f: 'docs/guide.md', sections: ['## 1.', '## 9.'] }], ...over })
const fs_ = col => col.map(x => x.f + (x.part ? ` (${x.part})` : ''))
reads('a heading is matched to a boundary — "## 1" never takes "## 10" (question 4)', () => { const p = READS.partOf('# T\n\n## 10 Ten\nten\n\n## 1 One\none\n', { sections: ['## 1'] }); return p.text.startsWith('## 1 One') && !p.text.includes('ten') ? '' : `took: ${p.text.split('\n')[0]}` })
/* the rules diet's step 3 (D1735, plan §4 and §6): the bug-check order, the design guide and the ripple map are read by
   section, and some of their parts are no heading of their own — §7.0 to §7.10 are bold-led paragraphs, §1's own text
   stands above its sub-headings, a surface is a table row, and the ripple map's note has a search printed */
const SPANDOC = '# T\n\nhead text\n\n## 1. One\n\nown text\n\n### 1a. Sub\n\nsub text\n\n## 7. Walk\n\n**7.0 Size.** zero\n\n**7.0a Round.** zero-a\n\n**7.1 Day.** one\n\n**7.10 Moment.** ten\n\n**7.11 Lessons.** eleven\n\n## 8. Find\n\n| Name | x |\n|---|---|\n| **Warn** | w |\n| **Warnings** | ws |\n\n```\n| **Fenced** | f |\n**7.11 fenced\n```\n'
const span = o => READS.partOf(SPANDOC, o)
reads('a span runs from a bold-led line to the line before another — "**7.0" takes 7.0a, never stops at "**7.10" for "**7.1"', () => {
  const a = span({ spans: [{ from: '**7.0', to: '**7.11' }] }), b = span({ spans: [{ from: '**7.1', to: '**7.11' }] })
  return a.text !== '**7.0 Size.** zero\n\n**7.0a Round.** zero-a\n\n**7.1 Day.** one\n\n**7.10 Moment.** ten\n' ? `took: ${JSON.stringify(a.text)}` : !b.text.startsWith('**7.1 Day') || !b.text.includes('**7.10') || b.text.includes('eleven') ? `from **7.1 took: ${JSON.stringify(b.text)}` : a.missing.length || b.missing.length ? 'a part was called missing' : ''
})
reads('a span with no from starts at the top; a section\'s own text stops at its first sub-heading', () => { const p = span({ spans: [{ to: '## 1.' }, { from: '## 1.', to: '### 1a.' }] }); return p.text === '# T\n\nhead text\n\n## 1. One\n\nown text\n' ? '' : `took: ${JSON.stringify(p.text)}` })
reads('a row is its one line, matched to a boundary; a line two parts share is counted once', () => {
  const r = span({ rows: ['| **Warn**'] }), both = span({ sections: ['## 8.'], rows: ['| **Warnings**', '| **Warn**'] }), sec = span({ sections: ['## 8.'] })
  return r.text !== '| **Warn** | w |' ? `the row took: ${JSON.stringify(r.text)}` : both.text !== sec.text ? 'a row inside a section was counted twice' : ''
})
reads('the grep reads every line, a fence\'s too, as grep -o would, after the parts; a row inside a fence is not a row', () => {
  const g = span({ sections: ['## 1.'], grep: '^\\| \\*\\*[^*]*\\*\\*' }), f = span({ rows: ['| **Fenced**'] })
  return g.text !== '## 1. One\n\nown text\n\n### 1a. Sub\n\nsub text\n\n| **Warn**\n| **Warnings**\n| **Fenced**' ? `took: ${JSON.stringify(g.text)}` : f.text !== '' || f.missing[0] !== '| **Fenced**' ? 'a fenced line was taken as a row' : ''
})
reads('a span\'s missing from or to, and a missing row, are reported and counted as nothing; alone, a missing upTo counts the file whole', () => {
  const p = span({ spans: [{ from: '**7.9', to: '**7.11' }, { from: '**7.0', to: '**7.99' }], rows: ['| **Nope**'] })
  const m = READS.measure({ files: [], read: f => (f === 'd.md' ? SPANDOC : null), est: rEst, jobs: [{ job: 'a', opens: [] }], taskReads: [{ f: 'd.md', upTo: '## 99.' }], checkReads: [{ f: 'd.md', spans: [{ from: '**7.0', to: '**7.99' }], rows: ['| **Warn**'] }] })
  const t = m.jobs[0].task[0], c = m.jobs[0].check[0]
  return p.text !== '' || p.missing.length !== 3 ? `took ${JSON.stringify(p.text)}, ${p.missing.length} missing` : t.tokens !== SPANDOC.length || !m.missing.some(s => /"## 99\."[^\n]*counted whole/.test(s)) ? 'a missing upTo alone was not counted whole and said so'
    : c.tokens !== '| **Warn** | w |'.length || !m.missing.some(s => /\*\*7\.99[^\n]*counted as nothing/.test(s)) ? 'a missing span end was not reported, or its part was counted' : c.part !== '**7.0 … **7.99 + the row | **Warn**' ? `the part was named "${c.part}"` : ''
})
/* the step-3 script read's missing cases (7 Nov 26): each near-miss comes FIRST, so a plain startsWith fails it */
reads('a span\'s from and to are matched to a boundary with the near-miss first — "**7.1" never takes "**7.10", "**7.0" never "**7.0a"', () => {
  const a = READS.partOf('**7.10 a\n**7.1 b\nc\n**7.2 d\n', { spans: [{ from: '**7.1', to: '**7.2' }] }), b = READS.partOf('**7.0a a\n**7.0 b\nc\n**7.1 d\n', { spans: [{ from: '**7.0', to: '**7.1' }] })
  const c = READS.partOf('**7.0 a\n**7.10 x\n**7.1 b\n', { spans: [{ from: '**7.0', to: '**7.1' }] })
  /* the second script read's medium 1: to is looked for after the from-line — never from the top, nor on the from-line itself */
  const d = READS.partOf('**B x\n**A a\nb\n**B c\n', { spans: [{ from: '**A', to: '**B' }] }), e = READS.partOf('**7.1 a\nb\n**7 c\n', { spans: [{ from: '**7.1', to: '**7' }] })
  return a.text !== '**7.1 b\nc' ? `from **7.1 took ${JSON.stringify(a.text)}` : b.text !== '**7.0 b\nc' ? `from **7.0 took ${JSON.stringify(b.text)}` : c.text !== '**7.0 a\n**7.10 x' ? `to **7.1 stopped at ${JSON.stringify(c.text)}` : d.text !== '**A a\nb' ? `a to before the from took ${JSON.stringify(d.text)}` : e.text !== '**7.1 a\nb' ? `a to the from-line starts with took ${JSON.stringify(e.text)}` : ''
})
reads('a row is matched to a boundary with the near-miss first', () => { const p = READS.partOf('| **Undone** | x |\n| **Undo** / redo | y |\n', { rows: ['| **Undo'] }); return p.text === '| **Undo** / redo | y |' ? '' : `took ${JSON.stringify(p.text)}` })
reads('a span with no from looks for its to from the first line, as upTo does; with no to it runs to the file\'s end', () => {
  const a = READS.partOf('## 0. zero\nz\n## 0. again\ny\n', { spans: [{ to: '## 0.' }] }), b = READS.partOf('a\n**B b\nc\n', { spans: [{ from: '**B' }] })
  return a.text !== '' || a.missing.length ? `with no from took ${JSON.stringify(a.text)}, ${a.missing.length} missing` : b.text !== '**B b\nc\n' || b.missing.length ? `with no to took ${JSON.stringify(b.text)}` : ''
})
reads('upTo with other parts takes its part beside them; missing, it is reported and only its part counts as nothing', () => {
  const a = span({ upTo: '## 1.', rows: ['| **Warn**'] }), b = span({ upTo: '## 99.', rows: ['| **Warn**'] })
  return a.text !== '# T\n\nhead text\n\n| **Warn** | w |' ? `took ${JSON.stringify(a.text)}` : b.text !== '| **Warn** | w |' || b.whole || b.missing[0] !== '## 99.' ? `missing took ${JSON.stringify(b.text)}` : ''
})
reads('a paragraph runs to a blank line or the next block at the margin; a list item keeps its indented lines', () => {
  const D = '**A one.** a\nmore a\n**B two.** b\n\n- **C.** c\n  more c\n- **D.** d\n', p = o => READS.partOf(D, { paras: [o] })
  const m = READS.partOf(D, { paras: ['**Z'] })
  return p('**A').text !== '**A one.** a\nmore a' ? `took ${JSON.stringify(p('**A').text)}` : p('**B').text !== '**B two.** b' ? `took ${JSON.stringify(p('**B').text)}` : p('- **C.').text !== '- **C.** c\n  more c' ? `took ${JSON.stringify(p('- **C.').text)}` : m.text !== '' || m.missing[0] !== '**Z' ? 'a missing paragraph was not reported'
    : ['## 2. b', '| x |', '```', '7. seven'].map(n => READS.partOf(`**A.** a\n${n}\n`, { paras: ['**A.'] }).text).find(t => t !== '**A.** a') ?? ''
})
reads('the grep drops empty matches and reads letters as letters (the u flag)', () => { const a = READS.partOf('aé\nb\n', { grep: 'x*' }), b = READS.partOf('café\n', { grep: '\\p{L}+' }), n = READS.partOf('é\n1\n', { grep: [{ re: '^\\p{L}', n: true }] }); return a.text !== '' ? `empty matches gave ${JSON.stringify(a.text)}` : b.text !== 'café' ? `took ${JSON.stringify(b.text)}` : n.text !== '1:é' ? `-n took ${JSON.stringify(n.text)}` : '' })
reads('a grep\'s range takes only its lines, both ends included as sed -n\'s does; n gives whole lines with their numbers; a missing end is reported', () => {
  const G = '# T\n## 1. A\n- **one** x\n| **two** | y |\n## 2. B\n| **three** | z |\n'
  const end = READS.partOf('# T\n## 1. A\n- **one** x\n## 2. B\n## 3. C\n', { grep: [{ re: '^## [0-9]', from: '## 1.', to: '## 2.' }] })
  if (end.text !== '## 1\n## 2') return `the range's end line was not printed: ${JSON.stringify(end.text)}`
  const a = READS.partOf(G, { grep: [{ re: '^\\| \\*\\*[^*]*\\*\\*|^- \\*\\*[^*]*\\*\\*', from: '## 1.', to: '## 2.' }] }), b = READS.partOf(G, { grep: [{ re: '^## ', n: true }] }), c = READS.partOf(G, { grep: [{ re: 'x', from: '## 1.', to: '## 9.' }] })
  return a.text !== '- **one**\n| **two**' ? `the range took ${JSON.stringify(a.text)}` : b.text !== '2:## 1. A\n5:## 2. B' ? `-n took ${JSON.stringify(b.text)}` : c.text !== '' || !/## 9\.[^\n]*grep's range/.test(c.missing[0] || '') ? 'a missing range end was not reported' : ''
})
reads('a read\'s label is empty when it is counted whole, and names every part — a paragraph, and a grep by its name or its pattern', () => {
  const m = READS.measure({ files: [], read: f => (f === 'd.md' ? SPANDOC : null), est: rEst, jobs: [{ job: 'a', opens: [] }], taskReads: [], checkReads: [{ f: 'd.md' }, { f: 'd.md', upTo: '## 99.' }, { f: 'd.md', spans: [{ from: '**7.1' }], sections: ['## 8.'], paras: ['**7.0a'], grep: [{ re: 'x', name: 'the list' }, '^a', { re: '^#', n: true }] }] })
  const [w, u, p] = m.jobs[0].check
  return w.part !== '' ? `the whole read was named "${w.part}"` : u.part !== '' ? `a missing upTo, counted whole, was named "${u.part}"` : p.part !== '**7.1 … the end + ## 8. + the paragraph **7.0a + the list + grep -o ^a + grep -n ^#' ? `the part was named "${p.part}"` : ''
})
reads('the start: rules with no paths:, the hook\'s note and each description — never a scoped rules file or a skill\'s body', () => {
  const m = rRun(), s = fs_(m.start).join(' | ')
  return s !== '.claude/rules/always.md | .claude/hooks/task-observer-session-start.sh (its note) | .claude/skills/s/SKILL.md (description) | .claude/agents/h.md (description)' ? `start was ${s}`
    : m.start[1].tokens !== 'the start note'.length ? 'the hook\'s note was not read from its here-document' : m.start[2].tokens !== 'a skill, described over two lines'.length ? 'the folded description was not read whole' : ''
})
reads('the note on each message is the hook\'s here-document', () => rRun().message?.tokens === 'the message note'.length ? '' : 'wrong note')
/* the rules diet's step 2 (D1740): a start hook that reads the skill-notes short form from its file is counted by that
   file; with the file missing the hook prints its fallback here-document, and that is what is counted */
const shortHook = '#!/usr/bin/env bash\nSHORT="${CLAUDE_PROJECT_DIR:-.}/.claude/skills/task-observer/SHORT-FORM.md"\nread -r -d \'\' FALLBACK <<\'EOF\' || true\nthe fallback\nEOF\n'
const startOf = files => READS.measure({ files: Object.keys(files), read: f => files[f] ?? null, est: rEst, jobs: [], taskReads: [], checkReads: [] }).start.find(x => /SHORT-FORM|session-start/.test(x.f))
reads('a start hook that names the short form is counted by that file, whole, not by its fallback', () => { const x = startOf({ ...RFILES, '.claude/hooks/task-observer-session-start.sh': shortHook, '.claude/skills/task-observer/SHORT-FORM.md': 'the short form, longer' }); return !x ? 'no start note' : x.f !== '.claude/skills/task-observer/SHORT-FORM.md' ? `counted ${x.f}` : x.tokens !== 'the short form, longer'.length ? 'not counted whole' : '' })
reads('with the short form missing, the same hook is counted by its fallback here-document', () => { const x = startOf({ ...RFILES, '.claude/hooks/task-observer-session-start.sh': shortHook }); return !x ? 'no start note' : x.f !== '.claude/hooks/task-observer-session-start.sh' ? `counted ${x.f}` : x.tokens !== 'the fallback'.length ? 'the fallback was not read' : '' })
/* a fresh reader's F1 and F5 (7 Nov 26): the full guide is not read again as a task read when the start gives the short
   form; a hook naming the file only in a comment, or an empty short form, is counted by the fallback it prints */
const TO_FULL = '.claude/skills/task-observer/SKILL.md', TO_SHORT = '.claude/skills/task-observer/SHORT-FORM.md', TO_HOOK = '.claude/hooks/task-observer-session-start.sh'
const taskOf = files => READS.measure({ files: Object.keys(files), read: f => files[f] ?? null, est: rEst, jobs: [{ job: 'notes', opens: [], check: false }], taskReads: [{ f: TO_FULL }, { f: 'HANDOFF.md' }], checkReads: [] }).jobs[0].task.map(x => x.f)
reads('with the short form given at the start, the full guide is not read again as a task read', () => { const t = taskOf({ ...RFILES, [TO_HOOK]: shortHook, [TO_SHORT]: 'the short form', [TO_FULL]: 'the full guide' }); return t.includes(TO_FULL) ? `task was ${t.join(', ')}` : '' })
reads('with the short form missing, the full guide is a task read again', () => { const t = taskOf({ ...RFILES, [TO_HOOK]: shortHook, [TO_FULL]: 'the full guide' }); return t.includes(TO_FULL) ? '' : `task was ${t.join(', ')}` })
reads('a hook naming the short form only in a comment is counted by its here-document', () => { const x = startOf({ ...RFILES, [TO_HOOK]: '#!/usr/bin/env bash\n# one day: .claude/skills/task-observer/SHORT-FORM.md\nread -r -d \'\' X <<\'EOF\' || true\nthe fallback\nEOF\n', [TO_SHORT]: 'the short form' }); return x?.f === TO_HOOK && x.tokens === 'the fallback'.length ? '' : `counted ${x?.f}` })
reads('an empty short form is counted by the fallback the hook prints', () => { const x = startOf({ ...RFILES, [TO_HOOK]: shortHook, [TO_SHORT]: '\n  \n' }); return x?.f === TO_HOOK && x.tokens === 'the fallback'.length ? '' : `counted ${x?.f}` })
reads('a notes job reads its task files and loads nothing; no check', () => { const j = rRun().jobs[0]; return fs_(j.task).join(' | ') !== 'HANDOFF.md | OUTSTANDING.md (up to ## Items)' ? `task was ${fs_(j.task).join(' | ')}` : j.check.length ? 'a check was counted' : j.task[1].tokens !== '# Backlog\n\nthe priority list\n'.length ? 'the backlog was not cut at its items' : '' })
reads('an opened file loads its area\'s rules and the CLAUDE.md of its folder, followed until nothing new loads; a file loaded once is not counted again', () => {
  const j = rRun().jobs[1], t = j.task.map(x => x.f), c = j.check.map(x => x.f)
  return !t.includes('.claude/rules/area-a.md') || !t.includes('app/CLAUDE.md') ? `task loaded ${t.join(', ')}`
    : !t.includes('.claude/rules/area-b.md') ? 'area B, whose paths: name the loaded area A, was not followed'
    : t.includes('.claude/rules/area-c.md') || c.includes('.claude/rules/area-c.md') ? 'area C, never opened, was counted'
    : c.filter(f => f === '.claude/rules/area-b.md').length ? 'area B was counted again in the check' : ''
})
reads('a check read of named sections takes each to the next heading of its level; a missing heading is reported', () => {
  const m = rRun(), x = m.jobs[1].check[0]
  return x.tokens !== '## 1. One\n\nthe first part\n\n### 1a. Below it\n\nstill the first\n'.length ? `the section read ${x.tokens} characters` : !m.missing.some(s => /no heading or line "## 9\."[^\n]*counted as nothing/.test(s)) ? 'the missing heading was not reported' : ''
})
reads('…and a check read loads in turn what its paths: name (the plan\'s layer J)', () => {
  const m = rRun({ jobs: [{ job: 'b', opens: ['HANDOFF.md'] }] }), c = m.jobs[0].check.map(x => x.f)
  return c.includes('.claude/rules/area-b.md') ? '' : `check loaded ${c.join(', ')}`
})
reads('follow stops on a cycle', () => READS.follow(['x'], [{ f: 'p', globs: ['x', 'q'] }, { f: 'q', globs: ['p'] }], []).map(x => x.f).join() === 'p,q' ? '' : 'it did not stop once each had loaded')

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
