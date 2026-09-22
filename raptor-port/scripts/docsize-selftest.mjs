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
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'

const HERE = dirname(fileURLToPath(import.meta.url))
const GATE = join(HERE, 'docsize.mjs')

const item = (id, n) => [`### [${id}] The ${id} item — OPEN`, '', ...Array.from({ length: n }, (_, i) => `Line ${i + 1} of ${id}, long enough to count as a real body line for the doubling check.`), ''].join('\n')
const LIVE0 = ['# Outstanding', '', '## Items', '', item('ALPHA', 6), item('BRAVO', 6), item('CHARLIE', 6), '## Done', '', item('DELTA', 3)].join('\n')
const ARCH0 = ['# Archive', '', item('OLD', 3)].join('\n')
const DEC0 = ['# DECISIONS', '', '| # | ruling | meaning | home |', '|---|---|---|---|', '| D2 | b | b | `OUTSTANDING.md` |', '| D1 | a | a | `OUTSTANDING.md` |', ''].join('\n')

let failed = 0
function scenario(name, expectFail, mutate, { mustSay } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'docsguard-'))
  const g = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const w = (f, t) => { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), t) }
  try {
    g('init', '-q', '-b', 'main')
    g('config', 'user.email', 'selftest@example.invalid'); g('config', 'user.name', 'selftest'); g('config', 'core.autocrlf', 'false')
    w('raptor-port/scripts/docsize.mjs', readFileSync(GATE, 'utf8'))
    w('OUTSTANDING.md', LIVE0); w('OUTSTANDING-ARCHIVE.md', ARCH0); w('DECISIONS.md', DEC0)
    w('raptor-port/src/app.ts', 'export const a = 1\n')
    g('add', '-A'); g('commit', '-q', '-m', 'base')
    const base = g('rev-parse', 'HEAD').trim()
    const ctx = {
      read: f => readFileSync(join(dir, f), 'utf8'), write: w,
      commit: (msg) => { g('add', '-A'); g('commit', '-q', '-m', msg) },
      edit: (f, fn) => w(f, fn(readFileSync(join(dir, f), 'utf8'))),
    }
    mutate(ctx)
    const r = spawnSync(process.execPath, ['raptor-port/scripts/docsize.mjs'], { cwd: dir, encoding: 'utf8', env: { ...process.env, DOCSGUARD_BASE: base, DOCSGUARD_ALLOW: '' } })
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
scenario('a line removed from the append-only archive', true, c => c.edit('OUTSTANDING-ARCHIVE.md', t => t.replace(/^Line 2 of OLD.*\n/m, '')), { mustSay: 'append-only' })
scenario('a new duplicate id', true, c => c.edit('OUTSTANDING.md', t => t + '\n' + item('ALPHA', 1).replace('Line 1 of ALPHA', 'A different body for ALPHA')), { mustSay: '[ALPHA] now appears 2 times' })
scenario('an id renamed without saying so (the item under "## Done" is still read)', true, c => c.edit('OUTSTANDING.md', t => t.replace(/^Line 2 of DELTA.*\n/m, '').replace('### [DELTA]', '### [DELTA-X]')), { mustSay: '[DELTA] is GONE' })
scenario('a deliberate removal declared in the commit', false, c => { c.edit('OUTSTANDING.md', t => cut(t, 'BRAVO')[0]); c.commit('drop BRAVO\n\nDocs-guard-allow: [BRAVO]') })
const renameLive = c => c.edit('OUTSTANDING.md', t => t.replace('### [BRAVO]', '### [BRAVO-CLOSED]'))
scenario('a live id renamed while its old id survives elsewhere — undeclared', true, c => { c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n' + item('BRAVO', 1).replace('Line 1 of BRAVO', 'The archived record of BRAVO')); c.commit('archive a BRAVO record'); renameLive(c) }, { mustSay: 'truncated on the way' })
scenario('the same rename, declared in the commit', false, c => { c.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n' + item('BRAVO', 1).replace('Line 1 of BRAVO', 'The archived record of BRAVO')); c.commit('archive a BRAVO record'); renameLive(c); c.commit('rename\n\nDocs-guard-allow: [BRAVO]') })
scenario('over a ceiling on a docs-only change', true, c => c.edit('DECISIONS.md', t => t + 'x\n'.repeat(200)), { mustSay: 'over its ceiling' })
scenario('over a ceiling inside a code change is deferred, not failed', false, c => { c.edit('DECISIONS.md', t => t + 'x\n'.repeat(200)); c.edit('raptor-port/src/app.ts', t => t + 'export const b = 2\n') }, { mustSay: 'deferred (D29)' })
scenario('a ceiling moved in a commit that also touches src', true, c => { c.edit('raptor-port/scripts/docsize.mjs', t => t.replace("['DECISIONS.md',                       1,  150,", "['DECISIONS.md',                       1,  400,")); c.edit('raptor-port/src/app.ts', t => t + 'export const b = 2\n'); c.commit('sneak') }, { mustSay: 'touches raptor-port/src' })
scenario('a ceiling moved in a docs-only commit', false, c => { c.edit('raptor-port/scripts/docsize.mjs', t => t.replace("['DECISIONS.md',                       1,  150,", "['DECISIONS.md',                       1,  400,")); c.commit('raise, with its reason') })

const addRow = (c, home) => c.edit('DECISIONS.md', t => t.replace('|---|---|---|---|\n', `|---|---|---|---|\n| D3 | c | c | ${home} |\n`))
scenario('a new ruling whose home does not exist (F6)', true, c => addRow(c, '`docs/nowhere.md`'), { mustSay: 'no such file exists' })
scenario('a new ruling naming a home this change never wrote (D29\'s own defect)', true, c => addRow(c, '`OUTSTANDING.md`'), { mustSay: 'does not touch that file' })
scenario('a new ruling whose home was written in the same change', false, c => { addRow(c, '`OUTSTANDING.md`'); c.edit('OUTSTANDING.md', t => t + '\nThe ruling D3, carried here.\n') })
scenario('a new ruling with only a future home ("on build:")', false, c => addRow(c, 'this file; on build: `OUTSTANDING.md`'))

console.log(failed ? `\nSELFTEST FAILED — ${failed} scenario(s) not caught as designed.` : '\nselftest OK — every scenario behaved as designed.')
process.exit(failed ? 1 : 0)
