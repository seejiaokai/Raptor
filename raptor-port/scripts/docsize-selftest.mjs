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
  const gate = readFileSync(GATE, 'utf8').replace('const RULING_BYTES = [\n', "const RULING_BYTES = [\n  ['.claude/rules/decisions/general.md', 2, 6000],\n  ['.claude/rules/decisions/other.md', 2, 6000],\n")
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
scenario('a pointer typed with its § not at the end of the line', true, c => withGuide(c, guideOf(gPtr('Alpha'), '', 'See docs/guide-full.md §Alpha for more.'), fullOf('Alpha')), { mustSay: 'not at its end' })
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
