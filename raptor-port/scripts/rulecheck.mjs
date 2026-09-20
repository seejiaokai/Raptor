#!/usr/bin/env node
/* RULE CHECK — every behaviour the owner ruled must be NAMED by a test.
 *
 * Why this exists ([S4-BUGHUNT], 20 Sep 26): a bug survived two full
 * cross-provider code inspections and 5103 green tests, because it was not a
 * coding mistake. The build had taken one ruling and used it for a job that
 * ruling never claimed, and a LATER ruling on the same day covered that job.
 * Every test passed, because no test named either ruling — so when the rules
 * drifted apart, nothing went red.
 *
 * This is the cheap mechanical guard. It does not check that a rule is
 * IMPLEMENTED correctly — no script can. It checks that at least one test
 * mentions each rule by its id, so that a rule which changes has something
 * pointing at it, and so that a rule nobody has ever written a test for is
 * visible instead of silent.
 *
 * The baseline below is the set of rules that had no test naming them on the
 * day this was written. The check FAILS when that set grows — a new unnamed
 * rule — and tells you to shrink the baseline when it shrinks. It never
 * rewrites itself; removing a name from the baseline is a deliberate edit.
 *
 * Run: node scripts/rulecheck.mjs        (part of the gate suite)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/* Every ruling id in the rules of record, with the plain-words reminder that
   goes in the failure message. Keep in step with
   docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md. */
const RULES = {
  B1: 'several records on one person/day',
  B2: 'courses and overseas duty show on the war',
  B3: 'different parts of the day sit side by side, not a clash',
  B4: 'a worked day beside an absence earns OIL when the times miss',
  B5: 'publishing is a door; undo of the publish brings the bid back',
  B6: 'the replaced-bid notice, until "OK, seen"',
  B7: 'the same rules at every door, including redo',
  B8: 'a hand-typed credit with times; none means the whole day',
  B9: 'the main-code ladder',
  H1: 'which inputs replace an undecided bid',
  H2: 'a medical cuts leave in half-day steps',
  H3: 'overlap judged on real times (owner overrule)',
  H4: 'the 15-day run: pilots, LL/OL only',
  H5: 'filing leave for a posted-out person',
  H6: 'overnight tails; leave over part of a medical refused whole',
  Q1: 'two half-day leaves both come off their own balances',
  Q2: 'a member may bid each half separately',
  Q6: 'a medical on a worked day keeps both and goes amber',
  Q7: 'a hand-typed credit with no times is whole-day work',
  Q8: 'leave is allowed during a course or overseas duty',
  Q9: 'leave before posting-in and after posting-out',
  Q11: 'moving a bid into the next war is refused',
  Q12: 'leave on a "no leave" day is a warning only',
  Q13: 'the 15-day rule is LL/OL only',
  Q14: 'a member may file leave any date, already approved',
  Q15: 'a SANS offer is never work',
}

/* Rules with no test naming them on 20 Sep 26. The check fails if this set
   GROWS. Shrink it as the [S4-BUGHUNT] scenarios land their named tests. */
const BASELINE = new Set(['B8', 'Q9', 'Q11', 'Q12', 'Q14', 'Q15'])

const TEST_DIRS = [join(ROOT, 'src'), join(ROOT, 'e2e')]
const isTest = (f) => /\.(test|spec)\.(ts|tsx)$/.test(f)

function walk(dir, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const e of entries) {
    if (e === 'node_modules' || e.startsWith('.')) continue
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (isTest(e)) out.push(p)
  }
  return out
}

const files = TEST_DIRS.flatMap((d) => walk(d))
/* no test files at all means the script was run from the wrong place, not
   that every rule lost its test — say so rather than raising 26 alarms */
if (!files.length) {
  console.error(`FAIL — no test files found under ${TEST_DIRS.join(' or ')}.`)
  console.error('Run this from the repo (npm run rulecheck), not from a copy.')
  process.exit(2)
}
const haystack = files.map((f) => readFileSync(f, 'utf8')).join('\n')

const unnamed = Object.keys(RULES).filter((id) => !new RegExp(`\\b${id}\\b`).test(haystack))

const added = unnamed.filter((id) => !BASELINE.has(id))
const cleared = [...BASELINE].filter((id) => !unnamed.includes(id))

console.log(`rulecheck: ${files.length} test files, ${Object.keys(RULES).length} rulings`)
console.log(`  named by a test : ${Object.keys(RULES).length - unnamed.length}`)
console.log(`  named by nothing: ${unnamed.length}${unnamed.length ? ` (${unnamed.join(', ')})` : ''}`)

if (cleared.length) {
  console.log(`\n  ${cleared.length} now covered — remove from BASELINE in this file: ${cleared.join(', ')}`)
}

if (added.length) {
  console.error(`\nFAIL — ${added.length} ruling(s) no test names, and not in the baseline:\n`)
  for (const id of added) console.error(`  ${id} — ${RULES[id]}`)
  console.error(`\nName the rule in a test ("... (${added[0]})"), or add it to BASELINE with a reason.`)
  process.exit(1)
}

console.log('\nrulecheck OK')
